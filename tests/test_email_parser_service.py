"""EmailParserService — bank-balance extraction (audit task 4ae4b3ca, AC4)."""
import pytest
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


@pytest.mark.parametrize("text,balance,currency", [
    ("مانده: ۱۲٬۵۰۰٬۰۰۰ ریال", 12500000.0, "IRR"),
    ("بانک ملت\nبرداشت:1,200,000\nمانده:45,300,000\n1403/07/20", 45300000.0, None),
    ("مانده حساب 7,000,000 ريال", 7000000.0, "IRR"),
    ("Avl Bal AED 1,234.50", 1234.5, "AED"),
    ("Your Avail. Bal is AED 9,876.00", 9876.0, "AED"),
    ("Purchase of AED 50.00. Bal: AED 1,100.25", 1100.25, "AED"),
])
def test_bank_sms_balance_words_are_read(text, balance, currency):
    """2026-10-11 (owner): «مانده» and «Avl Bal / Bal:» SMS used to carry no balance at all."""
    r = parse_balance(text)
    assert r.balance == balance and r.currency == currency


def test_the_new_words_do_not_turn_prose_into_money():
    assert parse_balance("work-life balance 10 tips").balance is None
    assert parse_balance("global market update").balance is None
