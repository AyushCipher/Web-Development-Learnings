from fastapi import FastAPI, HTTPException, Depends, Header
from jose import jwt
from datetime import datetime, time, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

app = FastAPI()

SECRET_KEY = "my_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth Setup
oauth2_schema = OAuth2PasswordBearer(tokenUrl="token")

# Dummy user database for demonstration purposes
users_db = {
    "user": {
        "username": "user",
        "hashed_password": pwd_context.hash("password")
    }
}

# Hash Password function
def hash_password(password: str):
    return pwd_context.hash(password)


# Verify Password function
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


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
    user = users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(data={"sub": username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


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
def protected_route(authorization: str = Header(...)):
    token = authorization.split(" ")[1]  # Extract the token from the "Bearer <token>" format
    username = verify_token(token)
    return {"message": f"Hello, {username}. You have access to this protected route."}

# In this file, we have implemented a FastAPI application that includes JWT authentication with password hashing using OAuth2. The application has the following features:
# 1. A login endpoint that generates a JWT token upon successful authentication, using hashed passwords for security.
# 2. A protected endpoint that requires a valid JWT token to access.
# 3. A token verification function that checks the validity and expiration of the token.

