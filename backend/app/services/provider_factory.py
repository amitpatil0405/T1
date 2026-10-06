from app.core.config import settings
from app.services.historical_data_service import HistoricalMarketDataService
from app.services.yfinance_provider import YFinanceHistoricalProvider

def get_historical_data_provider() -> HistoricalMarketDataService:
    provider_name = settings.HISTORICAL_DATA_PROVIDER.lower()
    if provider_name == "yfinance":
        return YFinanceHistoricalProvider()
    else:
        return YFinanceHistoricalProvider()
