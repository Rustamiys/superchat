from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from .models import User

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

class User(BaseModel):
    id: int
    name: str
    surname: str
    birthday: date


users_db: List[User] = []

@app.get("/api/users", response_model=List[User])
def get_users(id: int):
    return users_db

@app.post("/api/users", response_model=User)
def add_user(user: User):    
    for existing_user in users_db:
        if existing_user.id == user.id:
            raise HTTPException(status_code=400, detail="Пользователь с таким ID уже существует")
    users_db.append(user)
    return user

@app.put("/api/users/{user_id}", response_model=User)
def update_user(user_id: int, updated_user: User):
    for idx, user in enumerate(users_db):
        if user.id == user_id:
            users_db[idx] = updated_user
            return updated_user
    raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.delete("api/users/{user_id}", response_model=dict)
def delete_user(user_id: int):
    for user in users_db:
        if user.id == user_id:
            users_db.remove(user)
            return {"message": "Пользователь успешно удален"}
    raise HTTPException(status_code=404, detail="Пользователь не найден")
