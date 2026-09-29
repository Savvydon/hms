from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.notification import Notification

router=APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def list_notifications(db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id==current_user.id).order_by(desc(Notification.created_at)).limit(50).all()

@router.patch("/{notification_id}/read")
def mark_read(notification_id:int, db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    n=db.query(Notification).filter(Notification.id==notification_id,Notification.user_id==current_user.id).first()
    if not n: raise HTTPException(404,"Notification not found")
    n.is_read=True; db.commit(); return {"message":"Notification marked as read"}
