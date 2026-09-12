from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

users = []

class User(BaseModel):
    name: str
    email: str
    age: int

@app.post("/users")
def create_user(user: User):
    users.append(user)
    return {"message": "User created successfully!", "data": user}


@app.put("/users/{user_id}")
def update_user(user_id: int, user: User, notify: bool = False):
    if user_id < 0 or user_id >= len(users):
        return {"message": "User not found"}
    
    users[user_id] = user

    if notify:
        return {"message": "User updated successfully!", "data": user}
    return {"message": "User updated successfully!", "data": user}

# So in this file we learnt how to use POST + PUT methods + query params + path params + pydantic models + list of users and how to update them using put method.