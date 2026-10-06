from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.db.models import HistoricalOHLC, User
from app.api.auth import get_current_user
from app.services.backfill_engine import HistoricalBackfillEngine, aggregate_timeframes

router = APIRouter(prefix="/historical", tags=["historical"])

@router.get("/{symbol}")
def get_stock_historical_ohlc(
    symbol: str,
    timeframe: str = Query("daily", description="daily, weekly, monthly, yearly"),
    history_range: Optional[str] = Query(None, description="2Y or 3Y"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symbol_upper = symbol.upper()
    db_records = db.query(HistoricalOHLC).filter(
        HistoricalOHLC.symbol == symbol_upper,
        HistoricalOHLC.timeframe == "daily"
    ).order_by(HistoricalOHLC.date.asc()).all()

    if not db_records:
        engine = HistoricalBackfillEngine(db)
        engine.backfill_stock(symbol_upper, years=3)
        db_records = db.query(HistoricalOHLC).filter(
            HistoricalOHLC.symbol == symbol_upper,
            HistoricalOHLC.timeframe == "daily"
        ).order_by(HistoricalOHLC.date.asc()).all()

    if not db_records:
        return {"status": "unavailable", "message": "Historical data unavailable", "data": []}

    daily_dicts = [
        {
            "date": r.date,
            "open": r.open,
            "high": r.high,
            "low": r.low,
            "close": r.close,
            "volume": r.volume
        }
        for r in db_records
    ]

    aggregated = aggregate_timeframes(daily_dicts, timeframe=timeframe, history_range=history_range)
    return {"status": "success", "symbol": symbol_upper, "timeframe": timeframe, "data": aggregated}


@router.post("/backfill-all")
def backfill_all(
    years: int = Query(3, ge=1, le=5),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    engine = HistoricalBackfillEngine(db)
    res = engine.backfill_all_stocks(years=years)
    return {"status": "success", "backfilled_counts": res}
