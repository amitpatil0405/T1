import logging
from sqlalchemy.orm import Session
from app.db.models import HistoricalOHLC, OptionChainData

logger = logging.getLogger(__name__)

def perform_historical_data_reset(db: Session) -> dict:
    try:
        deleted_ohlc = db.query(HistoricalOHLC).delete()
        deleted_option_chain = db.query(OptionChainData).delete()
        db.commit()
        return {
            "status": "success",
            "message": "Historical data reset completed successfully.",
            "deleted_ohlc_records": deleted_ohlc,
            "deleted_option_chain_records": deleted_option_chain
        }
    except Exception as e:
        db.rollback()
        raise e
