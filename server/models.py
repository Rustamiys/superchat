from sqlalchemy import Column, Integer, String, Date
from database import Base
from sqlalchemy.orm import Mapped

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    surname = Column(String, index=True)
    birthday = Column(Date)
    username = Column(String, unique=True, index=True)
    password = Column(String)

class Message(Base):
    __tablename__ = 'messages'

    id: Mapped[int] = Column(Integer, unique=True, autoincrement=True, primary_key=True)
    message: Mapped[str] = Column(String)
    sender_id: Mapped[str] = Column(Integer)
    recipient_id: Mapped[str] = Column(Integer)
