from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User as DBUser
from schemas import UserCreate, UserResponse, UserRegister, UserLogin

app = FastAPI()

# CORS для клиента
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Подключаем клиент
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация базы данных
Base.metadata.create_all(bind=engine)

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

@app.post("/api/users", response_model=UserResponse)
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(DBUser).filter(DBUser.id == user.id).first():
        raise HTTPException(status_code=400, detail="Пользователь с таким ID уже существует")
    db_user = DBUser(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, updated_user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    for key, value in updated_user.dict().items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}", response_model=dict)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(db_user)
    db.commit()
    return {"message": "Пользователь успешно удален"}
