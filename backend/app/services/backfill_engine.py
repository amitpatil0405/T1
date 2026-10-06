import logging
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.db.models import HistoricalOHLC, Stock
from app.services.provider_factory import get_historical_data_provider

logger = logging.getLogger(__name__)

class HistoricalBackfillEngine:
    def __init__(self, db: Session):
        self.db = db
        self.provider = get_historical_data_provider()

    def backfill_stock(self, symbol: str, years: int = 3) -> int:
        end_date = date.today()
        start_date = end_date - timedelta(days=years * 365)
        records = self.provider.fetch_daily_ohlc(symbol, start_date=start_date, end_date=end_date)
        if not records:
            return 0

        saved_count = 0
        for rec in records:
            existing = self.db.query(HistoricalOHLC).filter(
                HistoricalOHLC.symbol == symbol,
                HistoricalOHLC.date == rec["date"],
                HistoricalOHLC.timeframe == "daily"
            ).first()

            if existing:
                existing.open = rec["open"]
                existing.high = rec["high"]
                existing.low = rec["low"]
                existing.close = rec["close"]
                existing.volume = rec.get("volume", 0.0)
            else:
                ohlc_obj = HistoricalOHLC(
                    symbol=symbol,
                    date=rec["date"],
                    timeframe="daily",
                    open=rec["open"],
                    high=rec["high"],
                    low=rec["low"],
                    close=rec["close"],
                    volume=rec.get("volume", 0.0)
                )
                self.db.add(ohlc_obj)
            saved_count += 1

        self.db.commit()
        return saved_count

    def backfill_all_stocks(self, years: int = 3) -> Dict[str, int]:
        stocks = self.db.query(Stock).filter(Stock.is_active == True).all()
        results = {}
        for stock in stocks:
            count = self.backfill_stock(stock.symbol, years=years)
            results[stock.symbol] = count
        return results


def aggregate_timeframes(daily_records: List[Dict[str, Any]], timeframe: str = "daily", history_range: Optional[str] = None) -> List[Dict[str, Any]]:
    if not daily_records:
        return []

    if history_range in ["2Y", "3Y"]:
        num_years = 2 if history_range == "2Y" else 3
        cutoff_date = (date.today() - timedelta(days=num_years * 365)).strftime("%Y-%m-%d")
        daily_records = [r for r in daily_records if r["date"] >= cutoff_date]

    if timeframe.lower() == "daily" or not daily_records:
        return daily_records

    df = pd.DataFrame(daily_records)
    df["date"] = pd.to_datetime(df["date"])
    df.set_index("date", inplace=True)
    df.sort_index(inplace=True)

    rule = "W-FRI"
    if timeframe.lower() in ["weekly", "w"]:
        rule = "W-FRI"
    elif timeframe.lower() in ["monthly", "m"]:
        rule = "ME"
    elif timeframe.lower() in ["yearly", "y"]:
        rule = "YE"

    resampled = df.resample(rule).agg({
        "open": "first",
        "high": "max",
        "low": "min",
        "close": "last",
        "volume": "sum"
    }).dropna()

    aggregated_records = []
    for dt, row in resampled.iterrows():
        aggregated_records.append({
            "date": dt.strftime("%Y-%m-%d"),
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row["volume"])
        })

    return aggregated_records
