from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Address(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str

# Pydantic Model for User
class User(BaseModel):
    name: str
    age: int
    email: str
    address: Address

# Home Route
@app.get("/")

def home(): 
    return {"message": "Welcome to the FastAPI application!"}

# About Route
@app.get("/about")
def about():
    return {"message": "This is the about page of the FastAPI application!"}


# User Route - Path Parameter
@app.get("/users/{user_id}")
def users(user_id: int):
    return {"user_id": user_id, "message": f"Details for user {user_id}"}



# Path Parameter vs Query Parameter


# Query Parameter
@app.get("/search")
def search(query: str=None):
    return {"query": query, "message": f"Search results for '{query}'"}

# Query parameters with default values
@app.get("/products")
def get_products(limit: int = 10, offset: int = 0):
    return {"limit": limit, "offset": offset, "message": f"Products from {offset} to {offset + limit}"}

# Multiple Query Parameters
@app.get("/items")
def get_items(category: str = None, price: float = None):
    return {"category": category, "price": price, "message": f"Items in category '{category}' with price '{price}'"}


# @app.post("/create-user")
# def create_user(name: str, age: int):
#     return {"name": name, "age": age, "message": f"User '{name}' of age {age} created successfully!"}

@app.post("/create-user")
def create_user(user: User):
    return {"name": user.name, "age": user.age, "message": f"User '{user.name}' of age {user.age} created successfully!"}


# dict vs pydantic 




@app.post("/create-user-pydantic")
def create_user_pydantic(user: User):
    return {"name": user.name, "age": user.age, "email": user.email, "message": f"User '{user.name}' of age {user.age} with email '{user.email}' created successfully!"}

# FASTAPI has automatic data validation

# Pydantic Nested Models
@app.post("/create-new-user-pydantic")
def create_new_user_pydantic(user: User):
    return {"name": user.name, "age": user.age, "email": user.email, "address": user.address, "message": f"User '{user.name}' of age {user.age} with email '{user.email}' and address '{user.address.street}, {user.address.city}, {user.address.state} {user.address.zip_code}' created successfully!"}

# What is a Pydantic, base model, What is Schema, how can we validate schema, what are nested models
# dist and pydantic diff , real world use case


