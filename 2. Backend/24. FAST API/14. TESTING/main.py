from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()


# ============================================================
# AUTHENTICATION SETUP
# ============================================================

# FastAPI expects the client to send:
#
# Authorization: Bearer <token>
#
# tokenUrl tells FastAPI where a client could obtain a token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Authentication dependency.

    FastAPI automatically extracts the Bearer token and
    passes it to this function.
    """

    if token != "valid_token":
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return {
        "username": "testuser"
    }


# ============================================================
# IN-MEMORY DATABASE
# ============================================================

# We use a Python dictionary instead of a real database.
#
# This keeps the example focused on:
# FastAPI + HTTP + pytest.
#
# In a real application, this would normally be replaced
# by PostgreSQL/SQLite + SQLAlchemy, etc.

items_db = {}

next_item_id = 1


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    """
    Public endpoint.

    Used to check whether the API is alive.
    """

    return {
        "status": "healthy"
    }


# ============================================================
# CREATE
# POST /items
# ============================================================

@app.post("/items", status_code=201)
def create_item(item: dict):
    """
    Create a new item.

    Example request:

    {
        "name": "Laptop",
        "price": 1200
    }
    """

    global next_item_id

    # Validate required field
    if "name" not in item:
        raise HTTPException(
            status_code=400,
            detail="Missing item name"
        )

    # Create ID
    item_id = next_item_id
    next_item_id += 1

    # Store item
    new_item = {
        "id": item_id,
        "name": item["name"],
        "price": item.get("price", 0)
    }

    items_db[item_id] = new_item

    return {
        "message": "Item created",
        "item": new_item
    }


# ============================================================
# READ ALL
# GET /items
# ============================================================

@app.get("/items")
def get_items():
    """
    Return all items.
    """

    return {
        "items": list(items_db.values())
    }


# ============================================================
# READ ONE
# GET /items/{item_id}
# ============================================================

@app.get("/items/{item_id}")
def get_item(item_id: int):
    """
    Return one item by ID.
    """

    item = items_db.get(item_id)

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    return {
        "item": item
    }


# ============================================================
# UPDATE
# PUT /items/{item_id}
# ============================================================

@app.put("/items/{item_id}")
def update_item(
    item_id: int,
    item: dict
):
    """
    Update an existing item.
    """

    if item_id not in items_db:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    if "name" not in item:
        raise HTTPException(
            status_code=400,
            detail="Missing item name"
        )

    updated_item = {
        "id": item_id,
        "name": item["name"],
        "price": item.get("price", 0)
    }

    items_db[item_id] = updated_item

    return {
        "message": "Item updated",
        "item": updated_item
    }


# ============================================================
# DELETE
# DELETE /items/{item_id}
# ============================================================

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    """
    Delete an item by ID.
    """

    if item_id not in items_db:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    del items_db[item_id]

    return {
        "message": "Item deleted"
    }


# ============================================================
# PROTECTED ENDPOINT
# GET /profile
# ============================================================

@app.get("/profile")
def get_profile(
    user: dict = Depends(get_current_user)
):
    """
    Protected endpoint.

    FastAPI first executes get_current_user().
    """

    return {
        "user": user,
        "secret_data": "top_secret"
    }
