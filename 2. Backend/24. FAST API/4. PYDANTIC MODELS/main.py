from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

users = []

class User(BaseModel):
    name: str
    age: int
    password: str

class UserResponse(BaseModel):
    name: str
    age: int

@app.post("/users", response_model=UserResponse)
def create_user(user: User):
    users.append(user)
    return user

@app.get("/users", response_model=list[UserResponse])
def get_users():
    return users

# In this file we learnt how to use POST + GET methods + response models + pydantic models + list of users and how to return them using get method.