"""RTAAccount — Dubai RTA app dashboard snapshot (task 32ade384).

Captures the RTA application dashboard (attachment #38): the greeting
name, the Salik toll account and its balance, the parking balance, and
the fines summary. Balances are ``Numeric`` so they stay decimals, not
strings. Follows the financial-account family convention (per-user,
``Numeric`` money columns) without inheriting the shared base, keeping
RTA-specific columns off the bank/broker/exchange rows.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.sql import func

from app.database import Base


class RTAAccount(Base):
    __tablename__ = "rta_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    user_name = Column(String(128), nullable=True)          # "Mohammadmehdi"
    salik_account_number = Column(String(32), nullable=True)  # "33352163"
    salik_balance = Column(Numeric(18, 2), nullable=False, default=0)   # 7.00
    parking_balance = Column(Numeric(18, 2), nullable=False, default=0)  # 0
    fines_payable = Column(Integer, nullable=False, default=0)
    fines_non_payable = Column(Integer, nullable=False, default=0)
    black_points = Column(Integer, nullable=False, default=0)
    currency_symbol = Column(String(8), nullable=True)      # "₿" as shown

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
