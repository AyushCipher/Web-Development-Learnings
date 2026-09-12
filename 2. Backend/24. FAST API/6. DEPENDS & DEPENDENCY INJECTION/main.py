from fastapi import FastAPI, Depends, Header, HTTPException

app = FastAPI()

# 1. The Common Function
def get_base_bonus():
    return 500  # Everyone gets at least 500


# 2. Function A (Depends on common logic)
def calculate_manager_pay(bonus: int = Depends(get_base_bonus)):
    salary = 4000
    return salary + bonus  # 4000 + 500 = 4500


# 3. Function B (Depends on common logic)
def calculate_intern_pay(bonus: int = Depends(get_base_bonus)):
    salary = 1500
    return salary + (bonus / 2)  # 1500 + 250 = 1750


# --- API Routes ---
@app.get("/manager")
def manager_route(total_pay: int = Depends(calculate_manager_pay)):
    return {"manager_total_pay": total_pay}

@app.get("/intern")
def intern_route(total_pay: int = Depends(calculate_intern_pay)):
    return {"intern_total_pay": total_pay}



# --- Auth Routes ---
def verify_token(x_token: str = Header(...)):
    if x_token != "mysecrettoken":
        raise HTTPException(status_code=400, detail="Invalid X-Token header")
    return x_token


@app.get("/users/{user_id}")
def get_user(user_id: int, x_token: str = Depends(verify_token)):
    users = [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]
    for user in users:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")


# In this file we learnt how to use Dependency Injection in FastAPI using Depends, how to create common logic for multiple routes, and how to implement authentication using header parameters.