from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.services.google_auth import (
    verify_google_token,
    exchange_code_for_token,
    get_or_create_user,
    create_jwt_token,
    get_all_pending_users,
    approve_user
)
from app.dependencies.auth import get_current_user
from app.models.user_oauth import OAuthUser, UserRole
from app.schemas.user_oauth import TokenResponse, OAuthUserResponse, OAuthUserUpdate
from app.core.config import settings

router = APIRouter(prefix="", tags=["google-auth"])

@router.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth consent screen.

    Consumer: direct browser navigation. The Persian "تلاش مجدد"
    (Try again) anchor in the /auth/pending HTML response points
    here (see line ~153 of this file), and end-users hit the URL
    directly when they click "Login with Google". Not invoked
    from frontend JS — that's why the no-frontend-fetch audit
    flags it as orphan. Keep.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID in environment variables."
        )
    
    redirect_uri = settings.GOOGLE_REDIRECT_URI or "http://localhost:8000/auth/google/callback"
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
    )
    
    return RedirectResponse(url=google_auth_url)

@router.get("/auth/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback."""
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

@router.get("/auth/me", response_model=OAuthUserResponse)
async def get_current_user_info(current_user: OAuthUser = Depends(get_current_user)):
    """Get current authenticated user info."""
    return current_user

@router.get("/admin/pending-users", response_model=list[OAuthUserResponse])
async def list_pending_users(
    db: AsyncSession = Depends(get_db),
    current_user: OAuthUser = Depends(get_current_user)
):
    """List all pending users (admin only)."""
    if current_user.email != "mohamad.mahdi1988@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access this endpoint."
        )
    return await get_all_pending_users(db)

@router.post("/admin/approve-user/{user_id}", response_model=OAuthUserResponse)
async def approve_pending_user(
    user_id: int,
    permissions: str = "read-only",
    db: AsyncSession = Depends(get_db),
    current_user: OAuthUser = Depends(get_current_user)
):
    """Approve a pending user (admin only)."""
    if current_user.email != "mohamad.mahdi1988@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can approve users."
        )
    
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
    if current_user.email != "mohamad.mahdi1988@gmail.com":
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
                {'<a href="/admin/panel" class="btn btn-primary">👑 پنل مدیریت</a>' if current_user.email == "mohamad.mahdi1988@gmail.com" else ''}
                <a href="/auth/logout" class="btn btn-danger">🚪 خروج</a>
            </div>
        </div>
    </body>
    </html>
    """