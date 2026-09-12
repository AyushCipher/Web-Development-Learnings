from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

users = []

class User(BaseModel):
    name: str
    age: int
    email: str

class UserNotFoundException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@app.exception_handler(UserNotFoundException)
def handle_user_not_found(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})


@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: User):
    users.append(user)
    return {"message": "User created successfully!", "data": user}


@app.get("/users", status_code=status.HTTP_201_CREATED)
def get_users():
    return {"message": "Users retrieved successfully!", "data": users}


@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id < 0 or user_id >= len(users):
        raise UserNotFoundException()
        # raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User retrieved successfully!", "data": users[user_id]}

# In this file we learnt how to use POST + GET methods + exception handling + custom exception classes + pydantic models + list of users and how to retrieve them using get method.
