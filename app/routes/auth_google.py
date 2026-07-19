import logging
import secrets
from urllib.parse import urlencode

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.google_auth import (
    verify_google_token,
    exchange_code_for_token,
    get_or_create_user,
    create_jwt_token,
    get_all_pending_users,
    approve_user,
    list_all_oauth_users,
    admin_update_oauth_user,
    delete_oauth_user,
    is_super_admin_email,
)
from app.dependencies.auth import get_current_user, get_current_admin_user, is_admin
from app.models.user_oauth import OAuthUser
from app.schemas.user_oauth import OAuthUserResponse, OAuthUserAdminUpdate
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["google-auth"])

# The three-tier access levels surfaced to the admin UI (label is Persian).
# Kept here so the /auth/config endpoint and the management views share one
# source of truth.
ACCESS_LEVELS = [
    {"key": "read-only", "label": "فقط خواندنی"},
    {"key": "editor", "label": "ویرایشگر"},
    {"key": "admin", "label": "ادمین (دسترسی کامل)"},
]


def _user_view(user: OAuthUser) -> dict:
    """Serialise an OAuthUser for the API, with the computed ``is_admin`` flag
    and ``is_super_admin`` so the frontend can disable controls on the
    operator account."""
    role = user.role.value if hasattr(user.role, "value") else user.role
    perms = user.permissions.value if hasattr(user.permissions, "value") else user.permissions
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": role,
        "permissions": perms,
        "status": user.status,
        "is_admin": is_admin(user),
        "is_super_admin": is_super_admin_email(user.email),
        "created_at": user.created_at.isoformat() if getattr(user, "created_at", None) else None,
    }


def _set_session_cookie(response: Response, jwt_token: str) -> None:
    """Store the session JWT in an httponly cookie for the server-rendered
    pages. ``samesite=lax`` is enough for the top-level-navigation OAuth
    flow; ``secure`` follows the deployment (Render serves HTTPS)."""
    response.set_cookie(
        key="access_token",
        value=f"Bearer {jwt_token}",
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production",
    )

@router.get("/auth/google")
async def google_login():
    """Server-rendered "Sign in with Google" page.

    Uses Google Identity Services (the in-browser credential flow) rather
    than the classic redirect/consent-screen dance, so it works WITHOUT a
    configured ``GOOGLE_REDIRECT_URI`` — the operator only has to add the
    deployment origin to the OAuth client's "Authorized JavaScript origins".
    The GIS button hands us an ID token (``credential``) which the page POSTs
    to :func:`google_login_token`; that endpoint sets the session cookie and
    the page then redirects (to /dashboard, or /auth/pending if unapproved).

    The classic redirect flow at ``/auth/google/callback`` is kept for
    backward compatibility but is no longer the primary entry point.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID in environment variables.",
        )

    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html lang="fa">
    <head>
        <title>ورود با گوگل - Lifemanager</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <style>
            body {{
                font-family: 'Vazir', 'Tahoma', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex; justify-content: center; align-items: center;
                height: 100vh; margin: 0; direction: rtl;
            }}
            .card {{
                background: white; border-radius: 20px; padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center;
                max-width: 380px;
            }}
            h1 {{ color: #333; margin-bottom: 8px; font-size: 22px; }}
            p {{ color: #888; margin-bottom: 28px; font-size: 14px; }}
            #gbtn {{ display: flex; justify-content: center; }}
            #err {{ color: #dc3545; margin-top: 18px; font-size: 14px; min-height: 20px; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div style="font-size:48px;margin-bottom:10px;">🔐</div>
            <h1>ورود به Lifemanager</h1>
            <p>برای ادامه با حساب گوگل خود وارد شوید</p>
            <div id="gbtn"></div>
            <div id="err"></div>
        </div>
        <script>
            async function onCredential(resp) {{
                document.getElementById('err').textContent = 'در حال ورود...';
                try {{
                    const r = await fetch('/auth/google/token', {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{ credential: resp.credential }})
                    }});
                    const data = await r.json();
                    if (!r.ok) {{
                        document.getElementById('err').textContent = data.detail || 'ورود ناموفق بود';
                        return;
                    }}
                    if (data.user && data.user.status === 'pending') {{
                        window.location.href = '/auth/pending';
                    }} else {{
                        window.location.href = '/dashboard';
                    }}
                }} catch (e) {{
                    document.getElementById('err').textContent = 'خطا در ارتباط با سرور';
                }}
            }}
            window.onload = function() {{
                google.accounts.id.initialize({{
                    client_id: '{settings.GOOGLE_CLIENT_ID}',
                    callback: onCredential
                }});
                google.accounts.id.renderButton(
                    document.getElementById('gbtn'),
                    {{ theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill' }}
                );
            }};
        </script>
    </body>
    </html>
    """)


@router.get("/auth/config")
async def auth_config():
    """Public auth configuration for the SPA login page.

    Exposes the Google client id (so the React app can render the GIS
    button without a build-time env var) and the available access levels.
    Safe to be public — the client id is not a secret.
    """
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID or "",
        "google_enabled": bool(settings.GOOGLE_CLIENT_ID),
        "access_levels": ACCESS_LEVELS,
        "admin_configured": bool(settings.admin_emails_list),
    }


@router.post("/auth/google/token")
async def google_login_token(
    response: Response,
    credential: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    """Exchange a Google Identity Services ``credential`` (ID token) for a
    Lifemanager session.

    This is the single sign-in entry point shared by BOTH the React SPA and
    the server-rendered /auth/google page. It verifies the Google token
    (issuer + audience), upserts the OAuth user (ADMIN_EMAILS are bootstrapped
    as approved admins, everyone else lands as ``pending``), issues our JWT,
    sets it as an httponly cookie (for the server pages) AND returns it in the
    body (for the SPA, which stores it in localStorage).
    """
    claims = await verify_google_token(credential)
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن گوگل نامعتبر است",
        )

    email = claims.get("email")
    name = claims.get("name")
    user = await get_or_create_user(db, email, name)
    jwt_token = create_jwt_token(user)
    _set_session_cookie(response, jwt_token)

    logger.info("Google login: %s (role=%s, status=%s)", user.email, user.role, user.status)
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": _user_view(user),
    }

# ── Google Drive connection (OAuth, offline access) ─────────────────────────
# A SEPARATE consent flow from sign-in: it requests offline access + the
# ``drive.file``/``spreadsheets`` scopes so we get a refresh_token, then stores
# it (encrypted) via drive_settings_service. The state is prefixed ``drive:``
# so the SHARED callback below can tell a Drive-connect round-trip apart from a
# normal sign-in. Mirrors ALLIN1's /api/auth/google/drive/connect flow.
DRIVE_STATE_PREFIX = "drive:"


async def _require_drive_operator(token: str, request: Request, db: AsyncSession):
    """Authorize the caller to manage the (single, app-wide) Drive connection.

    Accepts the JWT from the ``?token=`` query param (a top-level browser
    navigation from the SPA can't add an Authorization header) OR the normal
    header/cookie. Allowed when the caller is an admin; in a pure single-tenant
    deployment (no ADMIN_EMAILS configured and auth not enforced) the sole
    operator is allowed through so the personal app works without Google
    sign-in first."""
    from app.dependencies.auth import (
        _extract_token,
        _resolve_token_to_user,
        is_admin,
    )

    tok = token or _extract_token(request)
    user = await _resolve_token_to_user(tok, db) if tok else None
    if user is not None and is_admin(user):
        return
    if not settings.admin_emails_list and not settings.REQUIRE_AUTH:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Drive connection management requires an admin account",
    )


@router.get("/auth/google/drive/connect")
async def google_drive_connect(
    request: Request,
    token: str = "",
    db: AsyncSession = Depends(get_db),
):
    """Start the Drive-connect consent flow (offline access → refresh_token).

    Redirects the browser to Google's consent screen with ``access_type=offline``
    + ``prompt=select_account consent`` (so the user can PICK which Google
    account to link, and Google always returns a refresh_token) and a ``drive:``
    state nonce stashed in an httponly cookie for CSRF protection. The SPA opens
    this as a top-level navigation, passing its JWT as ``?token=``.
    """
    await _require_drive_operator(token, request, db)

    if not (settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
        )
    if not settings.GOOGLE_REDIRECT_URI:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Set GOOGLE_REDIRECT_URI to your /auth/google/callback URL to connect Drive.",
        )

    from app.services.google_api_client import GOOGLE_SCOPES

    nonce = secrets.token_urlsafe(24)
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        # Drive + Gmail(read/send) + Calendar(read) — one consent, one token.
        "scope": " ".join(GOOGLE_SCOPES),
        "access_type": "offline",
        # select_account → let the user choose WHICH Google account to connect
        # (not silently the current browser session); consent → force a
        # refresh_token even on a re-connect.
        "prompt": "select_account consent",
        "include_granted_scopes": "true",
        "state": f"{DRIVE_STATE_PREFIX}{nonce}",
    }
    consent_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    resp = RedirectResponse(url=consent_url, status_code=302)
    resp.set_cookie(
        key="drive_oauth_state",
        value=nonce,
        httponly=True,
        max_age=600,
        samesite="lax",
        secure=settings.ENVIRONMENT.lower() == "production",
    )
    return resp


async def _handle_drive_callback(code: str, state: str, request: Request, db: AsyncSession):
    """Drive-mode branch of the shared OAuth callback: verify the state nonce,
    exchange the code for tokens (incl. the refresh_token), and persist the
    connection. Always redirects back to the Drive settings tab with a status
    flag rather than returning JSON (it's a browser navigation)."""
    nonce = state[len(DRIVE_STATE_PREFIX):]
    cookie_nonce = request.cookies.get("drive_oauth_state") if request else None
    if not cookie_nonce or cookie_nonce != nonce:
        return RedirectResponse(url="/settings?tab=drive&drive=error&reason=state", status_code=302)

    token_data = await exchange_code_for_token(code)
    if not token_data:
        return RedirectResponse(url="/settings?tab=drive&drive=error&reason=exchange", status_code=302)

    refresh_token = token_data.get("refresh_token")
    if not refresh_token:
        # Google only returns a refresh_token on the FIRST consent; prompt=consent
        # is meant to force it. If it's still missing, the user must revoke the
        # app's access at myaccount.google.com and reconnect.
        return RedirectResponse(url="/settings?tab=drive&drive=error&reason=norefresh", status_code=302)

    email = None
    id_token = token_data.get("id_token")
    if id_token:
        claims = await verify_google_token(id_token)
        email = (claims or {}).get("email")

    from app.services import drive_settings_service as dss
    from app.services.google_api_client import build_drive_client, ensure_app_folders

    await dss.store_connection(db, refresh_token=refresh_token, account_email=email)
    # Eagerly create the LifeManagerData folder tree so the first sync is instant
    # and the status panel can show the root folder id immediately. Best-effort.
    try:
        drive_client = await build_drive_client(db)
        if drive_client is not None:
            await ensure_app_folders(db, drive_client)
    except Exception as exc:
        logger.warning("Drive folder bootstrap after connect failed: %r", exc)

    resp = RedirectResponse(url="/settings?tab=drive&drive=connected", status_code=302)
    resp.delete_cookie("drive_oauth_state")
    logger.info("Google Drive connected (account=%s)", email or "unknown")
    return resp


@router.get("/auth/google/callback")
async def google_callback(
    request: Request,
    code: str,
    state: str = "",
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback (shared by sign-in AND Drive-connect).

    A ``drive:``-prefixed ``state`` routes to the Drive-connect branch; anything
    else is the legacy sign-in code flow below."""
    if state and state.startswith(DRIVE_STATE_PREFIX):
        return await _handle_drive_callback(code, state, request, db)

    # Exchange code for tokens
    token_data = await exchange_code_for_token(code)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange authorization code for tokens."
        )
    
    # Verify ID token
    id_token = token_data.get("id_token")
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No ID token received from Google."
        )
    
    user_info = await verify_google_token(id_token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to verify Google token."
        )
    
    email = user_info.get("email")
    name = user_info.get("name")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No email received from Google."
        )
    
    # Get or create user
    user = await get_or_create_user(db, email, name)
    
    # Create JWT token
    jwt_token = create_jwt_token(user)
    
    # Redirect based on user status
    if user.status == "pending":
        return RedirectResponse(url="/auth/pending", status_code=302)
    
    # Store token in cookie and redirect to dashboard
    response = RedirectResponse(url="/dashboard", status_code=302)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {jwt_token}",
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax"
    )
    return response

@router.get("/auth/pending", response_class=HTMLResponse)
async def pending_page():
    """Page for users awaiting approval."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>در انتظار تأیید - Lifemanager</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {
                font-family: 'Vazir', 'Tahoma', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                direction: rtl;
            }
            .card {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
            }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.8; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            .btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 20px;
                text-decoration: none;
                display: inline-block;
            }
            .btn:hover { background: #5a67d8; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">⏳</div>
            <h1>در انتظار تأیید ادمین</h1>
            <p>حساب کاربری شما توسط ادمین سیستم در حال بررسی است.<br>
            پس از تأیید، می‌توانید وارد شوید.</p>
            <p style="font-size: 14px; color: #999;">لطفاً بعداً دوباره تلاش کنید.</p>
            <a href="/auth/google" class="btn">تلاش مجدد</a>
        </div>
    </body>
    </html>
    """

@router.get("/auth/me")
async def get_current_user_info(current_user=Depends(get_current_user)):
    """Current authenticated user — works for BOTH the Google OAuth identity
    and a local password account.

    Returns a unified dict (not a strict OAuth response model) so a local
    ``User`` token doesn't 500 on the missing role/permissions/status columns.
    The ``is_admin`` flag is computed server-side and is what the SPA uses to
    decide whether to show the user-management UI.
    """
    role = getattr(current_user, "role", None)
    perms = getattr(current_user, "permissions", None)
    return {
        "id": current_user.id,
        "email": getattr(current_user, "email", None),
        "name": getattr(current_user, "name", None) or getattr(current_user, "username", None),
        "role": role.value if hasattr(role, "value") else role,
        "permissions": perms.value if hasattr(perms, "value") else perms,
        # Local users have no `status` column → report them as active.
        "status": getattr(current_user, "status", None) or "active",
        "is_admin": is_admin(current_user),
        "is_super_admin": is_super_admin_email(getattr(current_user, "email", None)),
    }

# ── User management API (admin only) ────────────────────────────────────────
# These are the JSON endpoints the React "User Management" page calls. Each is
# gated by get_current_admin_user (role-based; see app/dependencies/auth.py).

@router.get("/auth/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin_user),
):
    """All OAuth users with their role / access level / status (admin only)."""
    users = await list_all_oauth_users(db)
    return {"users": [_user_view(u) for u in users], "access_levels": ACCESS_LEVELS}


@router.patch("/auth/users/{user_id}")
async def update_user(
    user_id: int,
    patch: OAuthUserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin_user),
):
    """Update a user's role (admin/user), access level (read-only/editor/admin)
    and status (approved/pending/rejected). Super-admins are immutable."""
    user = await admin_update_oauth_user(
        db,
        user_id,
        role=patch.role,
        permissions=patch.permissions,
        status=patch.status,
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد")
    return {"user": _user_view(user)}


@router.delete("/auth/users/{user_id}")
async def remove_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin_user),
):
    """Delete a user. Super-admins (ADMIN_EMAILS) cannot be deleted."""
    ok = await delete_oauth_user(db, user_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حذف ناموفق بود (کاربر یافت نشد یا super-admin است)",
        )
    return {"ok": True}

@router.get("/admin/pending-users", response_model=list[OAuthUserResponse])
async def list_pending_users(
    db: AsyncSession = Depends(get_db),
    current_user: OAuthUser = Depends(get_current_admin_user)
):
    """List all pending users (admin only)."""
    return await get_all_pending_users(db)

@router.post("/admin/approve-user/{user_id}", response_model=OAuthUserResponse)
async def approve_pending_user(
    user_id: int,
    permissions: str = "read-only",
    db: AsyncSession = Depends(get_db),
    current_user: OAuthUser = Depends(get_current_admin_user)
):
    """Approve a pending user (admin only)."""
    user = await approve_user(db, user_id, permissions)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return user

@router.get("/admin/panel", response_class=HTMLResponse)
async def admin_panel(
    current_user: OAuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin panel HTML page."""
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access this page."
        )
    
    pending_users = await get_all_pending_users(db)
    
    users_html = ""
    for user in pending_users:
        users_html += f"""
        <tr>
            <td>{user.email}</td>
            <td>{user.name or '—'}</td>
            <td><span class="badge pending">در انتظار</span></td>
            <td>
                <select class="perm-select" data-user-id="{user.id}">
                    <option value="read-only">فقط خواندنی</option>
                    <option value="editor">ویرایشگر</option>
                    <option value="admin">ادمین</option>
                </select>
            </td>
            <td>
                <button class="btn-approve" data-user-id="{user.id}">تأیید</button>
            </td>
        </tr>
        """
    
    if not users_html:
        users_html = "<tr><td colspan='5' style='text-align: center; padding: 40px; color: #999;'>هیچ کاربر در انتظار تأییدی وجود ندارد.</td></tr>"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>پنل مدیریت - Lifemanager</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Vazir', 'Tahoma', sans-serif;
                background: #f5f7fa;
                direction: rtl;
                padding: 20px;
            }}
            .container {{ max-width: 1200px; margin: 0 auto; }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 15px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            .header h1 {{ font-size: 24px; }}
            .header .email {{ font-size: 14px; opacity: 0.8; }}
            .card {{
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            }}
            table {{ width: 100%; border-collapse: collapse; }}
            th, td {{ padding: 15px; text-align: right; border-bottom: 1px solid #eee; }}
            th {{ background: #f8f9fa; color: #555; font-weight: 600; }}
            tr:hover {{ background: #f8f9fa; }}
            .badge {{
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }}
            .badge.pending {{ background: #fff3cd; color: #856404; }}
            .badge.approved {{ background: #d4edda; color: #155724; }}
            select {{
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            }}
            .btn-approve {{
                background: #28a745;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
            }}
            .btn-approve:hover {{ background: #218838; }}
            .btn-approve:disabled {{ background: #ccc; cursor: not-allowed; }}
            .toast {{
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 15px 30px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                display: none;
                animation: slideDown 0.3s ease;
            }}
            .toast.success {{ background: #28a745; }}
            .toast.error {{ background: #dc3545; }}
            @keyframes slideDown {{
                from {{ transform: translateX(-50%) translateY(-100px); opacity: 0; }}
                to {{ transform: translateX(-50%) translateY(0); opacity: 1; }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div>
                    <h1>👑 پنل مدیریت</h1>
                    <div class="email">{current_user.email}</div>
                </div>
                <a href="/auth/logout" style="color: white; text-decoration: none; opacity: 0.8;">خروج</a>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px; color: #333;">📋 کاربران در انتظار تأیید</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ایمیل</th>
                            <th>نام</th>
                            <th>وضعیت</th>
                            <th>سطح دسترسی</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users_html}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="toast" class="toast"></div>

        <script>
            document.querySelectorAll('.btn-approve').forEach(btn => {{
                btn.addEventListener('click', async function() {{
                    const userId = this.dataset.userId;
                    const select = document.querySelector(`.perm-select[data-user-id="${{userId}}"]`);
                    const permissions = select ? select.value : 'read-only';
                    
                    this.disabled = true;
                    this.textContent = 'در حال تأیید...';
                    
                    try {{
                        const response = await fetch(`/admin/approve-user/${{userId}}?permissions=${{permissions}}`, {{
                            method: 'POST',
                            headers: {{
                                'Content-Type': 'application/json'
                            }}
                        }});
                        
                        if (response.ok) {{
                            showToast('✅ کاربر با موفقیت تأیید شد!', 'success');
                            this.closest('tr').remove();
                            
                            // Check if table is empty
                            const tbody = document.querySelector('tbody');
                            if (tbody.children.length === 0) {{
                                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">هیچ کاربر در انتظار تأییدی وجود ندارد.</td></tr>';
                            }}
                        }} else {{
                            const error = await response.json();
                            showToast('❌ ' + (error.detail || 'خطا در تأیید کاربر'), 'error');
                        }}
                    }} catch (err) {{
                        showToast('❌ خطا در ارتباط با سرور', 'error');
                    }} finally {{
                        this.disabled = false;
                        this.textContent = 'تأیید';
                    }}
                }});
            }});

            function showToast(message, type) {{
                const toast = document.getElementById('toast');
                toast.textContent = message;
                toast.className = 'toast ' + type;
                toast.style.display = 'block';
                
                setTimeout(() => {{
                    toast.style.display = 'none';
                }}, 3000);
            }}
        </script>
    </body>
    </html>
    """

@router.get("/auth/logout")
async def logout():
    """Logout user by clearing cookie."""
    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie(key="access_token")
    return response

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(current_user: OAuthUser = Depends(get_current_user)):
    """Dashboard page after login."""
    role_display = {
        "admin": "مدیر سیستم",
        "approved": "کاربر تأیید شده",
        "pending": "در انتظار تأیید"
    }
    
    perm_display = {
        "read-only": "فقط خواندنی",
        "editor": "ویرایشگر",
        "admin": "مدیر"
    }
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>داشبورد - Lifemanager</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {{
                font-family: 'Vazir', 'Tahoma', sans-serif;
                background: #f5f7fa;
                direction: rtl;
                padding: 20px;
            }}
            .container {{ max-width: 800px; margin: 0 auto; }}
            .card {{
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.05);
                margin-bottom: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 30px;
                text-align: center;
            }}
            .header h1 {{ font-size: 28px; margin-bottom: 10px; }}
            .info-row {{ display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; }}
            .info-row:last-child {{ border-bottom: none; }}
            .label {{ color: #666; }}
            .value {{ font-weight: 600; color: #333; }}
            .badge {{
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }}
            .badge.admin {{ background: #cce5ff; color: #004085; }}
            .badge.approved {{ background: #d4edda; color: #155724; }}
            .badge.pending {{ background: #fff3cd; color: #856404; }}
            .btn {{
                display: inline-block;
                padding: 10px 25px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 600;
                margin: 5px;
                transition: all 0.3s;
            }}
            .btn-primary {{ background: #667eea; color: white; }}
            .btn-primary:hover {{ background: #5a67d8; }}
            .btn-danger {{ background: #dc3545; color: white; }}
            .btn-danger:hover {{ background: #c82333; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 خوش آمدید، {current_user.name or current_user.email}!</h1>
                <p>به Lifemanager خوش آمدید</p>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px; color: #333;">👤 اطلاعات کاربری</h2>
                <div class="info-row">
                    <span class="label">ایمیل</span>
                    <span class="value">{current_user.email}</span>
                </div>
                <div class="info-row">
                    <span class="label">نام</span>
                    <span class="value">{current_user.name or '—'}</span>
                </div>
                <div class="info-row">
                    <span class="label">نقش</span>
                    <span class="value"><span class="badge {current_user.role.value if hasattr(current_user.role, 'value') else current_user.role}">{role_display.get(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role, 'نامشخص')}</span></span>
                </div>
                <div class="info-row">
                    <span class="label">سطح دسترسی</span>
                    <span class="value">{perm_display.get(current_user.permissions.value if hasattr(current_user.permissions, 'value') else current_user.permissions, 'نامشخص')}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                {'<a href="/admin/panel" class="btn btn-primary">👑 پنل مدیریت</a>' if is_admin(current_user) else ''}
                <a href="/auth/logout" class="btn btn-danger">🚪 خروج</a>
            </div>
        </div>
    </body>
    </html>
    """