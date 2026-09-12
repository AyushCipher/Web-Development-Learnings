from fastapi import FastAPI, Request
import time

app = FastAPI()


@app.middleware("http")
async def my_middleware(request: Request, call_next):
    print("--> Request came in")

    start_time = time.time()

    # Pass the request to the actual endpoint
    response = await call_next(request)

    process_time = time.time() - start_time

    print(f"<-- Request completed in {process_time:.4f} seconds")

    return response


@app.get("/")
async def home():
    print("[Handler] Inside endpoint")
    return {"message": "Hello World"}

# In this file we learnt how to use middleware in FastAPI to log the time taken for each request and response.