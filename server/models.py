from sqlalchemy import Column, Integer, String, Date
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    surname = Column(String, index=True)
    birthday = Column(String)
    username = Column(String, unique=True, index=True)  # Для логина
    password = Column(String)  # Для пароля


# class Message(Base):
#     __tablename__ = 'messages'
#
#     id: Mapped[int] = Column(Integer, unique=True, autoincrement=True, primary_key=True)
#     message: Mapped[str] = Column(String)
#     sender_id: Mapped[str] = Column(Integer)
#     recipient_id: Mapped[str] = Column(Integer)
