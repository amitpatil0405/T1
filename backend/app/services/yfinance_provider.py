import yfinance as yf
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
import logging
from app.services.historical_data_service import HistoricalMarketDataService

logger = logging.getLogger(__name__)

SYMBOL_MAPPING = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "SBICARD": "SBICARD.NS",
    "HUNVR": "HINDUNILVR.NS",
    "MARUTI": "MARUTI.NS",
}

class YFinanceHistoricalProvider(HistoricalMarketDataService):
    def fetch_daily_ohlc(
        self,
        symbol: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        ticker_symbol = SYMBOL_MAPPING.get(symbol.upper(), f"{symbol.upper()}.NS")
        if not start_date:
            start_date = date.today() - timedelta(days=3 * 365)
        if not end_date:
            end_date = date.today()

        try:
            ticker = yf.Ticker(ticker_symbol)
            df = ticker.history(
                start=start_date.strftime("%Y-%m-%d"),
                end=(end_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                interval="1d"
            )
            if df.empty:
                return []
            records = []
            for idx, row in df.iterrows():
                dt_str = idx.strftime("%Y-%m-%d")
                records.append({
                    "date": dt_str,
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": float(row["Volume"]) if "Volume" in row else 0.0
                })
            return records
        except Exception as e:
            logger.error(f"Failed to fetch yfinance data for {symbol}: {e}")
            return []
