"""EmailParserService — bank-balance extraction (audit task 4ae4b3ca, AC4)."""
from app.services.email_parser_service import EmailParserService, parse_balance


def test_parses_rial_balance_from_persian_email():
    svc = EmailParserService()
    result = svc.parse_balance("بانک ملت\nموجودی: 12,500,000 ریال\nبا تشکر")
    assert result.balance == 12_500_000.0
    assert result.currency == "IRR"


def test_parses_usd_balance_with_symbol():
    result = parse_balance("Your account balance: $1,234.56 as of today")
    assert result.balance == 1234.56
    assert result.currency == "USD"


def test_parses_trailing_currency_code():
    result = parse_balance("balance is 1000 USD")
    assert result.balance == 1000.0
    assert result.currency == "USD"


def test_email_without_balance_returns_empty():
    result = parse_balance("Hello — this is a newsletter with no figures.")
    assert result.balance is None
    assert result.currency is None


def test_empty_body_is_safe():
    result = parse_balance("")
    assert result.balance is None
    assert result.currency is None
