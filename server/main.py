from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import schemas, models
from .database import SessionLocal, engine, Base
from .models import User as DBUser, UserChat, Message
from .schemas import UserCreate, UserResponse, UserRegister, UserLogin
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить запросы с любого источника
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)

# Инициализация базы данных
Base.metadata.create_all(bind=engine)

# # Хранилище подключенных клиентов
connected_clients: Dict[str, WebSocket] = {}

# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the SuperChat API"}

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(DBUser).all()

@app.post("/api/users/register", response_model=UserResponse)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    print(f"Received user data: {user}")
    if db.query(DBUser).filter(DBUser.username == user.username).first():
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")
    db_user = DBUser(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/users/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")
    return {"message": "Успешная авторизация", "user": {"id": db_user.id, "name": db_user.name}}

@app.websocket("/ws/chat")
async def chat(websocket: WebSocket, username: str):
    await websocket.accept()
    connected_clients[username] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            broadcast_message = {"from": username, "message": message_data.get("message", "")}
            await broadcast(json.dumps(broadcast_message))
    except WebSocketDisconnect:
        del connected_clients[username]
        print(f"{username} отключился.")

async def broadcast(message: str):
    """Рассылка сообщений всем подключенным клиентам."""
    for client in connected_clients.values():
        await client.send_text(message)

@app.websocket("/ws/chat/{user1}/{user2}")
async def chat(websocket: WebSocket, user1: str, user2: str):
    # Определяем уникальный чат между двумя пользователями
    room = f"{user1}-{user2}"
    await websocket.accept()

    # Создаем запись для чата в connected_clients, если еще не существует
    if room not in connected_clients:
        connected_clients[room] = {}

    # Добавляем текущее соединение в комнату
    connected_clients[room][user1] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            message = {"from": user1, "message": message_data.get("message", "")}

            # Отправляем сообщение в обе стороны чата
            if user2 in connected_clients[room]:
                await connected_clients[room][user2].send_text(json.dumps(message))
            if user1 in connected_clients[room]:
                await connected_clients[room][user1].send_text(json.dumps(message))
    except WebSocketDisconnect:
        del connected_clients[room][user1]  # Удаляем пользователя из комнаты
        if len(connected_clients[room]) == 0:
            del connected_clients[room]  # Удаляем комнату, если нет пользователей
        print(f"{user1} отключился от чата {room}.")

@app.get("/api/messages/{user1}/{user2}")
def get_messages(user1: str, user2: str, db: Session = Depends(get_db)):
    # Получаем chat_id для заданных пользователей
    chat = db.query(UserChat).filter(
        ((UserChat.user_1 == user1) & (UserChat.user_2 == user2)) |
        ((UserChat.user_1 == user2) & (UserChat.user_2 == user1))
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")

    # Получаем историю сообщений
    messages = db.query(Message).filter(Message.chat_id == chat.chat_id).order_by(Message.timestamp).all()
    return [{"from_user": msg.from_user, "message": msg.data, "timestamp": msg.timestamp} for msg in messages]

