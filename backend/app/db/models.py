from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Index, Text
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    sector = Column(String(50), index=True, nullable=False)
    weight = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    status = Column(String(50), default="Waiting for confirmation")
    events = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HistoricalOHLC(Base):
    __tablename__ = "historical_ohlc"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    date = Column(String(10), index=True, nullable=False)
    timeframe = Column(String(10), default="daily", index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=True)

    __table_args__ = (
        Index("idx_symbol_date_tf", "symbol", "date", "timeframe", unique=True),
    )


class OptionChainData(Base):
    __tablename__ = "option_chain_data"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    expiry_date = Column(String(10), nullable=False)
    strike_price = Column(Float, nullable=False)
    option_type = Column(String(5), nullable=False)
    open_interest = Column(Float, default=0.0)
    change_in_oi = Column(Float, default=0.0)
    implied_volatility = Column(Float, nullable=True)
    ltp = Column(Float, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
