"""ONE account = ONE card, whatever source saw it (owner, 2026-10-13, sheet 6).

«داده‌های موازی صرفاً برای تحکیمِ اطلاعات است، نه تجمیع»: the same Bank Saderat
account reached the finance page as four cards — IBAN ``AE53 0130 0027 7627 4214
006`` from a statement file, the bare account number ``2776274214006`` from another
file, the same IBAN again under the name «بانک صادرات ایران (Bank Saderat Iran)»,
and ``BSIUAE ••4006`` from the bank's SMS — and the page summed all four.

Why each path made a new card:
  * the exact-ref match also demanded matching bank NAMES («bsi» ≠ «Bank Saderat
    Iran»), so the very same IBAN was refused;
  * the strong digit-tail match merged only when exactly ONE card matched — with
    two duplicates already present it matched none and minted a third (that is how
    the first fix made it worse);
  * the SMS path never compared account numbers at all.

The identity here, strongest evidence first — and NEVER the balance (equal balances
prove nothing; the owner asked for «قرینه‌های محکم‌تر»):
  1. a full account number: identical, or one is a ≥10-digit tail of the other (an
     account number IS the tail of its IBAN). Names are not compared — sources
     spell one bank many ways; ten shared digits of a bank account are not a
     coincidence.
  2. a masked last-4 («••4006», SMS «a/c 4006») joins a card only when it is the
     SAME bank (alias-aware: bsi / BSIUAE / Bank Saderat / صادرات), the same
     currency, and exactly ONE such card ends in those digits.
Several cards that already share an identity are duplicates of one account: the
signal goes to the canonical one, and :func:`reconcile_duplicates` folds the rest
into it (statement lines move, synthetic balance rows are dropped, every merged
card is kept as a snapshot on the canonical card so the merge is reversible).

Pure helpers + one async reconciler; no FastAPI imports.
"""
from __future__ import annotations

import json
import logging
import re
from decimal import Decimal
from typing import Any, Dict, Iterable, List, Optional

logger = logging.getLogger(__name__)

STRONG_DIGITS = 10

#: One bank, many spellings. Key → aliases. A label matches when its compact form
#: equals an alias, starts with a short alias (≤4 chars, e.g. «bsi» → «bsiuae»), or
#: contains a long one («saderat», «صادرات»).
BANK_ALIASES: Dict[str, tuple] = {
    "saderat": ("saderat", "صادرات", "bsiuae", "bsi"),
    "fab": ("fab", "firstabudhabibank", "bankfab", "nbad"),
    "rakbank": ("rakbank", "nationalbankofrasalkhaimah"),
    "mashreq": ("mashreq", "mashreqbank"),
    "enbd": ("emiratesnbd", "enbd"),
    "adcb": ("adcb",),
}

#: Not banks: prepaid toll/transit/utility balances. A card still holds real money
#: (the Salik tag balance), but it is a «کیف‌پول/اعتبار», not a bank account.
WALLETS = ("salik", "darb", "nol", "rta", "dewa", "etisalat", "du", "careem", "swyp")


def compact(label: Any) -> str:
    return re.sub(r"[^0-9a-z؀-ۿ]+", "", str(label or "").lower())


def bank_key(label: Any) -> str:
    s = compact(label)
    if not s:
        return ""
    for key, aliases in BANK_ALIASES.items():
        for al in aliases:
            if s == al or (len(al) <= 4 and s.startswith(al)) or (len(al) >= 5 and al in s):
                return key
    return s


def is_wallet(label: Any) -> bool:
    s = compact(label)
    # short names match exactly only («du» must not swallow «Dubai Islamic Bank»)
    return bool(s) and any(s == w or (len(w) >= 4 and s.startswith(w)) for w in WALLETS)


def ref_digits(ref: Any) -> str:
    """Digits that identify the account. An IBAN drops its country+check («AE53»)."""
    r = re.sub(r"\s+", "", str(ref or ""))
    if re.match(r"^[A-Za-z]{2}\d{2}", r) and len(r) >= 15:
        r = r[4:]
    return re.sub(r"\D", "", r)


def strong_same(a: Any, b: Any) -> bool:
    da, db_ = ref_digits(a), ref_digits(b)
    short, long_ = (da, db_) if len(da) <= len(db_) else (db_, da)
    return len(short) >= STRONG_DIGITS and long_.endswith(short)


def masked_tail(ref: Any) -> Optional[str]:
    """The last-4 of a short/masked ref («••4006», «4006», «917»), else None."""
    d = ref_digits(ref)
    if 3 <= len(d) < STRONG_DIGITS:
        return d[-4:]
    return None


def _extra(acc) -> Dict[str, Any]:
    try:
        v = json.loads(acc.extra or "{}")
        return v if isinstance(v, dict) else {}
    except Exception:  # noqa: BLE001
        return {}


def card_refs(acc) -> List[str]:
    e = _extra(acc)
    out = [e.get("account_ref"), e.get("iban"), e.get("ref")]
    out += list(e.get("alias_refs") or [])
    return [str(x) for x in out if x]


def card_banks(acc) -> set:
    e = _extra(acc)
    labels = [acc.institution, acc.name] + list(e.get("alias_institutions") or [])
    return {bank_key(x) for x in labels if bank_key(x)}


def _full_refs(acc) -> List[str]:
    return [r for r in card_refs(acc) if len(ref_digits(r)) >= STRONG_DIGITS]


def is_merged(acc) -> bool:
    return bool(_extra(acc).get("merged_into"))


def canonical(cards: Iterable) -> Any:
    """Which of several cards of one account survives: a card with an IBAN, then the
    longest account number, then the oldest."""
    cards = [c for c in cards if not is_merged(c)]
    def score(c):
        e = _extra(c)
        has_iban = 1 if (e.get("iban") or any(re.match(r"^[A-Za-z]{2}\d{2}", r) for r in card_refs(c))) else 0
        longest = max([len(ref_digits(r)) for r in card_refs(c)] or [0])
        return (-has_iban, -longest, c.id or 0)
    return sorted(cards, key=score)[0] if cards else None


def find_card(accounts: Iterable, *, ref: Optional[str], institution: Optional[str] = None,
              currency: Optional[str] = None) -> Any:
    """The card this (ref, bank, currency) identifies, or None. Never by balance."""
    accounts = [a for a in accounts if not is_merged(a)]
    if not ref:
        return None
    strong = [a for a in accounts if any(strong_same(ref, r) for r in card_refs(a))]
    if strong:
        return canonical(strong)
    tail = masked_tail(ref)
    if not tail:
        return None
    bk = bank_key(institution)
    if not bk:
        return None
    # currency is NOT an identity test here: a figure in another unit on the same
    # bank+ref is the same account mis-read — the caller refuses to apply it
    # (no relabel, no new card). Merging EXISTING cards does require it.
    cands = []
    for a in accounts:
        if bk not in card_banks(a):
            continue
        if any(ref_digits(r).endswith(tail) for r in card_refs(a)):
            cands.append(a)
    full = [a for a in cands if _full_refs(a)]
    # several full cards are fine when they are ONE account (duplicates not yet
    # folded): «27762****4006» → the Bank Saderat account, never the sibling …4100
    if full and all(any(strong_same(x, y) for x in _full_refs(full[0]) for y in _full_refs(b)) for b in full[1:]):
        return canonical(full)
    if not full and len(cands) == 1:
        return cands[0]          # the same masked SMS card seen again
    return None


# --------------------------------------------------------------------------- #
# Folding the duplicates that already exist

def _same_account(a, b) -> bool:
    if any(strong_same(x, y) for x in card_refs(a) for y in card_refs(b)):
        return True
    # a masked card joins a full one: same bank, same currency, and that full card
    # is the ONLY full card of this bank ending in those digits (checked by caller)
    return False


def duplicate_groups(accounts: List) -> List[List]:
    """Machine-made cards grouped by account identity (owner-typed cards are never
    touched; archived history is never touched)."""
    live = [a for a in accounts if not is_merged(a) and _extra(a).get("inferred")
            and not _extra(a).get("archived")]
    parent = {a.id: a.id for a in live}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        rx, ry = find(x), find(y)
        if rx != ry:
            parent[ry] = rx

    for i, a in enumerate(live):
        for b in live[i + 1:]:
            if _same_account(a, b):
                union(a.id, b.id)
    # masked cards (SMS «••4006») → the unique full card of the same bank + currency
    for a in live:
        if _full_refs(a):
            continue
        tails = {masked_tail(r) for r in card_refs(a)} - {None}
        if not tails:
            continue
        banks = card_banks(a)
        full = [b for b in live if b.id != a.id and _full_refs(b) and banks & card_banks(b)
                and (not a.currency or not b.currency or str(a.currency).upper() == str(b.currency).upper())
                and any(ref_digits(r).endswith(t) for r in _full_refs(b) for t in tails)]
        roots = {find(b.id) for b in full}
        if len(roots) == 1:
            union(roots.pop(), a.id)
    groups: Dict[int, List] = {}
    for a in live:
        groups.setdefault(find(a.id), []).append(a)
    return [g for g in groups.values() if len(g) > 1]


def _latest(card) -> str:
    e = _extra(card)
    return str(e.get("owner_balance_at") or e.get("last_email_at") or e.get("last_message_at") or "")


async def reconcile_duplicates(db, *, dry_run: bool = False) -> Dict[str, Any]:
    """Fold every group of duplicate machine cards into its canonical card.
    Idempotent: a second run finds nothing. Returns what was (or would be) merged."""
    from sqlalchemy import delete, select

    from app.models.finance import FinancialAccount, Transaction

    accounts = (await db.execute(select(FinancialAccount))).scalars().all()
    report = []
    for group in duplicate_groups(accounts):
        keep = canonical(group)
        others = [c for c in group if c.id != keep.id]
        report.append({"keep": {"id": keep.id, "name": keep.name},
                       "merged": [{"id": c.id, "name": c.name, "balance": float(c.balance or 0)} for c in others]})
        if dry_run:
            continue
        ke = _extra(keep)
        # the most recent dated balance wins (an owner pin outranks a machine figure)
        newest = max(group, key=lambda c: (1 if _extra(c).get("owner_balance_at") else 0, _latest(c), -c.id))
        if newest.id != keep.id and newest.balance is not None:
            keep.balance = newest.balance
            ne = _extra(newest)
            for k in ("last_email_at", "last_message_at", "balance_evidence", "owner_balance_at"):
                if ne.get(k):
                    ke[k] = ne[k]
        keep_refs = set(r for r in card_refs(keep))
        have = {t.source_ref for t in (await db.execute(
            select(Transaction).where(Transaction.account_id == keep.id))).scalars().all() if t.source_ref}
        snaps = list(ke.get("merged_from") or [])
        for c in others:
            ce = _extra(c)
            moved = dropped = 0
            for t in (await db.execute(select(Transaction).where(Transaction.account_id == c.id))).scalars().all():
                if t.category == "_balance_delta" or (t.source_ref and t.source_ref in have):
                    dropped += 1          # synthetic bookkeeping / already on the kept card
                    await db.delete(t)
                else:
                    t.account_id = keep.id
                    moved += 1
                    if t.source_ref:
                        have.add(t.source_ref)
            for r in card_refs(c):
                if r not in keep_refs:
                    ke.setdefault("alias_refs", []).append(r)
                    keep_refs.add(r)
            for lab in (c.institution, c.name):
                if lab and bank_key(lab) and lab not in (ke.get("alias_institutions") or []):
                    ke.setdefault("alias_institutions", []).append(str(lab)[:120])
            for k in ("source_refs", "applied_refs"):
                ke[k] = list(dict.fromkeys(list(ke.get(k) or []) + list(ce.get(k) or [])))[-200:]
            snaps.append({"id": c.id, "name": c.name, "institution": c.institution, "currency": c.currency,
                          "balance": str(c.balance), "kind": c.kind, "extra": ce,
                          "created_at": c.created_at.isoformat() if c.created_at else None,
                          "moved_txns": moved, "dropped_synthetic": dropped})
            await db.execute(delete(FinancialAccount).where(FinancialAccount.id == c.id))
        ke["merged_from"] = snaps[-20:]
        keep.extra = json.dumps(ke, ensure_ascii=False)
        logger.info("finance: merged %s into card %s", [c.id for c in others], keep.id)
    if not dry_run and report:
        await db.commit()
    return {"groups": len(report), "merged": sum(len(g["merged"]) for g in report), "detail": report}


async def relabel_wallets(db) -> int:
    """A Salik/Nol/… card made from an SMS was filed as «بانک»: it is a wallet."""
    from sqlalchemy import select

    from app.models.finance import FinancialAccount

    n = 0
    for a in (await db.execute(select(FinancialAccount))).scalars().all():
        if a.kind == "bank" and _extra(a).get("inferred") and is_wallet(a.institution or a.name):
            a.kind = "wallet"
            n += 1
    if n:
        await db.commit()
    return n
