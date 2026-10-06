from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.api.auth import get_current_user
from app.services.reset_service import perform_historical_data_reset

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/reset-historical-data")
def reset_historical_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = perform_historical_data_reset(db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset historical data: {str(e)}"
        )
