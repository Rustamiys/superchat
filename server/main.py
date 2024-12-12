from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models import User as DBUser, Message, UserChat
from schemas import UserResponse, UserLogin, UserRegister
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend's origin(s) for production
    allow_credentials=False,
    allow_methods=["*"],  # Adjust to your needs
    allow_headers=["*"],  # Adjust to your needs
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

@app.get("/api/users/{login}", response_model=List[UserResponse])
def get_users(login: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.login==login).first()    
    if user:
        return [user]
    else:
        return {"status_code":404}

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    return users
    # print([UserResponse.from_orm(user) for user in users])
    # return [UserResponse.from_orm(user) for user in users]

@app.post("/api/users/register", response_model=UserResponse)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    print(f"Received user data: {user}")
    if db.query(DBUser).filter(DBUser.login==user.login).first():
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")
    db_user = DBUser(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/users/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.login == user.login).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")
    return {"status_code": 200, "user": {"id": db_user.id, "name": db_user.name}}

async def broadcast(message: str):
    """Рассылка сообщений всем подключенным клиентам."""
    for client in connected_clients.values():
        await client.send_text(message)

@app.websocket("/ws/chat/{user1}/{user2}")
async def chat(websocket: WebSocket, user1: str, user2: str, db: Session = Depends(get_db)):
    # Генерируем уникальный идентификатор чата (или получаем существующий)
    chat = db.query(UserChat).filter(
        ((UserChat.user_1 == user1) & (UserChat.user_2 == user2)) |
        ((UserChat.user_1 == user2) & (UserChat.user_2 == user1))
    ).first()

    if not chat:
        chat = UserChat(user_1=user1, user_2=user2, chat_id=f"{user1}-{user2}")
        db.add(chat)
        db.commit()
        db.refresh(chat)

    chat_id = chat.chat_id
    print(chat_id)
    await websocket.accept()

    # Подключаем текущего пользователя к комнате
    if chat_id not in connected_clients:
        connected_clients[chat_id] = {}
    connected_clients[chat_id][user1] = websocket

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Сохраняем сообщение в базу данных
            message = Message(
                chat_id=chat_id,
                from_user=user1,
                data=message_data.get("message", "")
            )
            db.add(message)
            db.commit()

            # Отправляем сообщение обоим участникам чата
            broadcast_message = {"senderId": user1, "text": message.data, "chat_id": message.chat_id, "sentDate": str(message.timestamp)}
            for user, conn in connected_clients[chat_id].items():
                print(user, conn)
                await conn.send_text(json.dumps(broadcast_message))
    except WebSocketDisconnect:
        # Удаляем пользователя из комнаты
        del connected_clients[chat_id][user1]
        if not connected_clients[chat_id]:  # Если комната пуста, удалить комнату
            del connected_clients[chat_id]
        print(f"{user1} отключился от чата {chat_id}.")

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
    return [{"senderId": msg.from_user, "text": msg.data, "sentDate": msg.timestamp} for msg in messages]