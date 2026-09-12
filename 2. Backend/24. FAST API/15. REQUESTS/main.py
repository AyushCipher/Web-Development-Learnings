import requests
from fastapi import FastAPI, HTTPException

# response = requests.get("https://pokeapi.co/api/v2/pokemon/ditto")
# if response.status_code == 200:
#     data = response.json()
#     print(data)
# else:
#     print(f"Failed to retrieve data: {response.status_code}")


app = FastAPI()

# Root Route
@app.get("/")
def home():
    return {"message": "PokeAPI proxy endpoints: /pokemon and /pokemon/{name}"}

# Get all data
@app.get("/pokemon")
def get_all_data():
    response = requests.get("https://pokeapi.co/api/v2/pokemon?limit=10")
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to retrieve data")


# Get specific data by name
@app.get("/pokemon/{name}")
def get_data_by_name(name: str):
    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{name}")
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to retrieve data")