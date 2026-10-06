from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import date

class HistoricalMarketDataService(ABC):
    @abstractmethod
    def fetch_daily_ohlc(
        self,
        symbol: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        pass
