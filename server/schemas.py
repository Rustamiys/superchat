from pydantic import BaseModel
from datetime import date

class UserBase(BaseModel):
    name: str
    surename: str
    birthday: str
    login: str

class UserRegister(UserBase):
    name: str
    surename: str
    birthday: str
    login: str
    password: str

class UserLogin(BaseModel):
    login: str
    password: str

class UserResponse(UserBase):
    class Config:
        orm_mode = True
