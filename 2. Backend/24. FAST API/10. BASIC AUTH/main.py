from fastapi import FastAPI, HTTPException, Depends, Header
from jose import jwt
from datetime import datetime, time, timedelta, timezone

app = FastAPI()

SECRET_KEY = "my_secret_key"

ALGORITHM = "HS256"


# Function to create a JWT token
def create_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Login endpoint
@app.post("/login")
def login(username: str, password: str):
    # For demonstration purposes, we will use a hardcoded username and password
    if username == "user" and password == "password":
        access_token_expires = timedelta(minutes=30)
        access_token = create_token(data={"sub": username}, expires_delta=access_token_expires)
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")


# Token verification function
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Protected endpoint that requires a valid token
@app.get("/protected")
def protected_route(username: str = Depends(verify_token)):
    return {"message": f"Hello, {username}. You have access to this protected route."}

# In this file, we have implemented a simple FastAPI application that includes JWT authentication. The application has the following features:
# 1. A login endpoint that generates a JWT token upon successful authentication.
# 2. A protected endpoint that requires a valid JWT token to access.
# 3. A token verification function that checks the validity and expiration of the token.

# The token is verified for validity and expiration before granting access to the protected route.