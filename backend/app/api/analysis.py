import pandas as pd
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Stock, HistoricalOHLC, User
from app.api.auth import get_current_user
from app.services.backfill_engine import HistoricalBackfillEngine, aggregate_timeframes
from app.services.indicator_engine import (
    calculate_rsi,
    calculate_bollinger_bands,
    classify_bollinger_position,
    detect_rsi_divergence,
    detect_candlestick_patterns,
    calculate_support_resistance,
    calculate_reversal_confluence
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/{symbol}")
def get_deep_analysis(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symbol_upper = symbol.upper()
    stock = db.query(Stock).filter(Stock.symbol == symbol_upper).first()

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
        return {
            "status": "unavailable",
            "symbol": symbol_upper,
            "message": "Historical data unavailable"
        }

    daily_dicts = [
        {"date": r.date, "open": r.open, "high": r.high, "low": r.low, "close": r.close, "volume": r.volume}
        for r in db_records
    ]

    df_daily = pd.DataFrame(daily_dicts)
    close_daily = df_daily["close"]

    rsi_daily_series = calculate_rsi(close_daily, period=14)
    daily_rsi = float(rsi_daily_series.iloc[-1]) if not rsi_daily_series.isna().iloc[-1] else None

    weekly_dicts = aggregate_timeframes(daily_dicts, timeframe="weekly")
    df_weekly = pd.DataFrame(weekly_dicts)
    if not df_weekly.empty and len(df_weekly) >= 14:
        rsi_weekly_series = calculate_rsi(df_weekly["close"], period=14)
        weekly_rsi = float(rsi_weekly_series.iloc[-1]) if not rsi_weekly_series.isna().iloc[-1] else None
    else:
        weekly_rsi = None

    cmp_val = float(close_daily.iloc[-1])

    upper_bb, mid_bb, lower_bb = calculate_bollinger_bands(close_daily, period=20, num_std=2.0)
    u_val = float(upper_bb.iloc[-1]) if not upper_bb.isna().iloc[-1] else None
    m_val = float(mid_bb.iloc[-1]) if not mid_bb.isna().iloc[-1] else None
    l_val = float(lower_bb.iloc[-1]) if not lower_bb.isna().iloc[-1] else None

    bb_position = "Inside Bands"
    bb_reversal = False
    if u_val and m_val and l_val:
        bb_position, bb_reversal = classify_bollinger_position(cmp_val, u_val, m_val, l_val)

    div_status, div_details, div_reversal = detect_rsi_divergence(close_daily, rsi_daily_series, lookback=30)
    pat_name, pat_type, pat_reversal, pat_date = detect_candlestick_patterns(df_daily)
    confluence_score = calculate_reversal_confluence(bb_reversal, div_reversal, pat_reversal)
    sr_levels = calculate_support_resistance(close_daily)

    return {
        "status": "success",
        "symbol": symbol_upper,
        "company_name": stock.name if stock else symbol_upper,
        "cmp": cmp_val,
        "daily_rsi": round(daily_rsi, 1) if daily_rsi is not None else None,
        "weekly_rsi": round(weekly_rsi, 1) if weekly_rsi is not None else None,
        "confluence_score": confluence_score,
        "bollinger_bands": {
            "upper": round(u_val, 2) if u_val else None,
            "middle": round(m_val, 2) if m_val else None,
            "lower": round(l_val, 2) if l_val else None,
            "position": bb_position,
            "is_reversal": bb_reversal
        },
        "rsi_divergence": {
            "status": div_status,
            "details": div_details,
            "is_reversal": div_reversal
        },
        "candlestick_pattern": {
            "pattern": pat_name,
            "type": pat_type,
            "is_reversal": pat_reversal,
            "date": pat_date
        },
        "support_resistance": sr_levels
    }
