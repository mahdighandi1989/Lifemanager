"""Re-export wrapper for ``FinancialAccount`` (audit task 4ae4b3ca AC 6)."""
from app.models.finance import FinancialAccount

__all__ = ["FinancialAccount"]


# Aliases for the kind-specific surfaces the AC list asks about. They
# all map onto the same `financial_accounts` table — the `kind`
# column discriminates. This avoids three near-identical models.
BankAccount = FinancialAccount
BrokerAccount = FinancialAccount
ExchangeAccount = FinancialAccount
