"""Re-export wrapper for the bank-account flavour (audit task 4ae4b3ca AC 20).

There is no separate ``bank_accounts`` table — bank accounts live in
``financial_accounts`` with ``kind='bank'``. This module exists so a
static grep for ``app/models/bank_account.py`` succeeds.
"""
from app.models.finance import FinancialAccount as BankAccount

__all__ = ["BankAccount"]
