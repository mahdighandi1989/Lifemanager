"""Supervisor's READ-ONLY finance audit (owner's approval, 2026-10-11).

Sheet 2 («موجودی به تفکیکِ ارز — اینها همه اشتباه محض») could not be answered:
the supervisor token is confined to «نظارت و سرکشی», so the routine could not
see a single account. The owner asked that the supervisor get exactly this:
financial data, read-only. Nothing here writes — SELECTs only, plus a DRY RUN of
the SMS balance pipeline (`explain_bank_message`) that shows, per recent finance
message, which card it would touch and why it would or would not move it.

Same gate as the inspection board (`_gate`): the supervisor token or the owner.
"""
from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.clarification import Clarification
from app.models.finance import FinancialAccount, Transaction
from app.routes.inspection import _gate

router = APIRouter()


def _extra(raw):
    try:
        v = json.loads(raw or "{}")
        return v if isinstance(v, dict) else {"_raw": str(raw)[:300]}
    except Exception:  # noqa: BLE001
        return {"_raw": str(raw)[:300]}


def _iso(v):
    return v.isoformat() if hasattr(v, "isoformat") else v


@router.get("/api/inspection/audit/finance", dependencies=[Depends(_gate)], tags=["inspection"])
async def finance_audit(days: int = Query(30, ge=1, le=365), messages: int = Query(200, ge=1, le=1000),
                        db: AsyncSession = Depends(get_db)):
    from app.services.finance_ingest_service import explain_bank_message

    accounts = (await db.execute(select(FinancialAccount).order_by(FinancialAccount.id))).scalars().all()
    by_scope: dict = defaultdict(lambda: defaultdict(lambda: {"total": Decimal(0), "accounts": 0}))
    acc_out = []
    for a in accounts:
        g = by_scope[str(a.user_id)][(a.currency or "?").upper()]
        g["total"] += Decimal(a.balance or 0)
        g["accounts"] += 1
        acc_out.append({"id": a.id, "user_id": a.user_id, "name": a.name, "kind": a.kind,
                        "institution": a.institution, "currency": a.currency, "balance": float(a.balance or 0),
                        "extra": _extra(a.extra), "created_at": _iso(a.created_at),
                        "updated_at": _iso(a.updated_at)})
    txns = (await db.execute(select(Transaction).order_by(Transaction.id.desc()).limit(400))).scalars().all()
    since = datetime.now(timezone.utc) - timedelta(days=days)
    logs = (await db.execute(
        select(ActivityLog).where(ActivityLog.action.in_(("mobile_sms", "mobile_notification")),
                                  ActivityLog.created_at >= since)
        .order_by(ActivityLog.id.desc()).limit(5000))).scalars().all()
    fin_msgs = []
    for lg in logs:
        d = lg.detail or ""
        if not d.startswith("[finance"):
            continue
        body = d.split("] ", 1)[1] if "] " in d else d
        if body.startswith("(") and ") " in body:  # the outcome note added 2026-10-11
            body = body.split(") ", 1)[1]
        sender = (lg.entity_label or "").split(" · ")[-1]
        when = getattr(lg, "occurred_at", None) or lg.created_at
        why = await explain_bank_message(db, user_id=int(lg.user_id or 0), channel="sms", body=body,
                                         sender=sender, occurred_iso=_iso(when))
        fin_msgs.append({"log_id": lg.id, "at": _iso(when), "user_id": lg.user_id, "action": lg.action,
                         "sender": sender, "text": body[:500], "explain": why})
        if len(fin_msgs) >= messages:
            break
    clar = (await db.execute(select(Clarification).order_by(Clarification.id.desc()).limit(80))).scalars().all()
    out = {
        "ok": True, "success": True, "read_only": True,
        "balances_by_scope": {s: [{"currency": c, "total": float(v["total"]), "accounts": v["accounts"]}
                                  for c, v in cur.items()] for s, cur in by_scope.items()},
        "accounts": acc_out,
        "transactions": [{"id": t.id, "account_id": t.account_id, "amount": float(t.amount or 0),
                          "type": t.transaction_type, "description": t.description, "category": t.category,
                          "currency": t.currency, "source": t.source, "source_ref": t.source_ref,
                          "occurred_on": _iso(t.occurred_on), "at": _iso(t.timestamp)} for t in txns],
        "finance_messages": fin_msgs,
        "finance_messages_scanned": len(logs),
        "clarifications": [{c.name: _iso(getattr(r, c.name)) for c in Clarification.__table__.columns}
                           for r in clar],
    }
    # nothing was written; say so explicitly — AFTER the rows were read (a
    # rollback expires them, and reading an expired row afterwards is lazy IO
    # outside the async context: MissingGreenlet on Postgres, 2026-10-11)
    await db.rollback()
    return out


class _AIProbe(BaseModel):
    system: str = ""
    user: str
    max_tokens: int | None = Field(None, ge=64, le=8192)


@router.post("/api/inspection/audit/ai", dependencies=[Depends(_gate)], tags=["inspection"])
async def ai_probe(payload: _AIProbe, db: AsyncSession = Depends(get_db)):
    """The supervisor runs the learning-architecture page's REAL AI path (task «learning_architecture», the
    model production would use) on prompts it supplies — e.g. the answer-check / same-structure pipelines
    on a neutral test problem (owner, 2026-10-13: «اون دو کار باز رو تموم کن»). No owner data is read or
    written; the only side effect is the gateway's own usage log. Same gate as the board."""
    if len(payload.system) > 20000 or len(payload.user) > 40000:
        raise HTTPException(status_code=413, detail="prompt too large")
    from app.services.ai.inference_gateway import complete

    res = await complete(db, payload.user, task="learning_architecture", system=payload.system or None,
                         max_tokens=payload.max_tokens or 6000)   # same budget rules as the page (default 6000, ≤ 8192)
    if not res.get("ok"):
        return {"ok": False, "success": False, "error": res.get("error") or "no_model", "text": ""}
    return {"ok": True, "success": True, "text": res.get("text") or "", "model": res.get("model")}
