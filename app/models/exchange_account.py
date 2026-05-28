"""Re-export wrapper for the exchange-account flavour (audit task 4ae4b3ca AC 21)."""
from app.models.finance import FinancialAccount as ExchangeAccount

__all__ = ["ExchangeAccount"]
