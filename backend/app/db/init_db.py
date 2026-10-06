from sqlalchemy.orm import Session
from app.db.models import User
from app.core.security import get_password_hash
from app.core.config import settings

def init_db(db: Session) -> None:
    admin = db.query(User).filter(User.user_id == settings.DEFAULT_ADMIN_USER_ID).first()
    if not admin:
        hashed_password = get_password_hash(settings.DEFAULT_ADMIN_PASSWORD)
        admin = User(
            user_id=settings.DEFAULT_ADMIN_USER_ID,
            hashed_password=hashed_password,
            is_active=True
        )
        db.add(admin)
        db.commit()
