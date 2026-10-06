from fastapi import APIRouter, Depends, Query
from typing import List, Optional
import json
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Stock, User
from app.api.auth import get_current_user
from app.models.schemas import StockResponse

router = APIRouter(prefix="/stocks", tags=["stocks"])

DEFAULT_UNIVERSE = [
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "sector": "Power, Energy & Infrastructure", "weight": 10.2, "status": "Bull Put spread (Bullish)", "events": ["Quarter Results"]},
    {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "Information Technology", "weight": 7.5, "status": "Waiting for confirmation", "events": ["Dividend"]},
    {"symbol": "INFY", "name": "Infosys Ltd", "sector": "Information Technology", "weight": 5.8, "status": "Bear Call spread (Bearish)", "events": []},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "sector": "Banking & Financial Services", "weight": 11.5, "status": "Bull Put spread (Bullish)", "events": ["Board Meeting"]},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "sector": "Banking & Financial Services", "weight": 8.0, "status": "Iron condor / Short strangle (Sideways)", "events": []},
    {"symbol": "SBICARD", "name": "SBI Cards & Payment Services", "sector": "Banking & Financial Services", "weight": 2.1, "status": "Waiting for confirmation", "events": []},
    {"symbol": "HUNVR", "name": "Hindustan Unilever Ltd", "sector": "FMCG", "weight": 3.4, "status": "Iron condor / Short strangle (Sideways)", "events": ["Buyback"]},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd", "sector": "Healthcare & Pharmaceuticals", "weight": 2.8, "status": "Bear Call spread (Bearish)", "events": []},
]

def seed_stocks_if_empty(db: Session):
    if db.query(Stock).count() == 0:
        for s in DEFAULT_UNIVERSE:
            stock = Stock(
                symbol=s["symbol"],
                name=s["name"],
                sector=s["sector"],
                weight=s["weight"],
                status=s["status"],
                events=json.dumps(s["events"])
            )
            db.add(stock)
        db.commit()

@router.get("", response_model=List[StockResponse])
def get_stocks(
    search: Optional[str] = Query(None),
    status_filter: Optional[List[str]] = Query(None),
    sector_filter: Optional[List[str]] = Query(None),
    events_filter: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_stocks_if_empty(db)
    query = db.query(Stock).filter(Stock.is_active == True)

    if search:
        search_term = f"%{search.strip().upper()}%"
        query = query.filter((Stock.symbol.like(search_term)) | (Stock.name.like(search_term)))

    stocks = query.all()
    results = []

    for s in stocks:
        st_events = json.loads(s.events) if s.events else []

        if status_filter and s.status not in status_filter:
            continue
        if sector_filter and s.sector not in sector_filter:
            continue
        if events_filter and not any(ev in st_events for ev in events_filter):
            continue

        results.append(StockResponse(
            symbol=s.symbol,
            name=s.name,
            sector=s.sector,
            weight=s.weight,
            status=s.status,
            cmp=None,
            daily_rsi=None,
            weekly_rsi=None,
            confluence="Data unavailable",
            events=st_events
        ))

    return results
