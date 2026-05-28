"""Re-export wrapper for the broker-account flavour (audit task 4ae4b3ca AC 20)."""
from app.models.finance import FinancialAccount as BrokerAccount

__all__ = ["BrokerAccount"]
