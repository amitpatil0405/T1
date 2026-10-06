from pydantic import BaseModel
from typing import List, Optional

class LoginRequest(BaseModel):
    user_id: str
    password: str

class LoginResponse(BaseModel):
    user_id: str
    status: str = "success"

class UserOut(BaseModel):
    user_id: str
    is_active: bool

class StockResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    weight: float
    status: str
    cmp: Optional[float] = None
    daily_rsi: Optional[float] = None
    weekly_rsi: Optional[float] = None
    confluence: str = "0/3"
    events: List[str] = []

    class Config:
        from_attributes = True
