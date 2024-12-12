# from sqlalchemy import Column, Integer, String, Date
from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

# Таблица пользователей
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    surename = Column(String, index=True)
    birthday = Column(String)
    login = Column(String, unique=True, index=True)  # Для логина
    password = Column(String)  # Для пароля

# Таблица сообщений
class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String, index=True)
    from_user = Column(String, index=True)
    data = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Таблица чатов
class UserChat(Base):
    __tablename__ = "users_chats"
    id = Column(Integer, primary_key=True, index=True)
    user_1 = Column(String, index=True)
    user_2 = Column(String, index=True)
    chat_id = Column(String, unique=True, index=True)