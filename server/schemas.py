from pydantic import BaseModel
from datetime import date

class UserBase(BaseModel):
    name: str
    surname: str

class UserCreate(UserBase):
    id: int
    birthday: date

class UserRegister(UserBase):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    birthday: date

    class Config:
        orm_mode = True
