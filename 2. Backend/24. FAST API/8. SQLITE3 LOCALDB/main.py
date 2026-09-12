import sqlite3
from fastapi import FastAPI

app = FastAPI()

conn = sqlite3.connect('mydatabase.db', check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        email TEXT NOT NULL
    )
''')

conn.commit()

@app.post("/users")
def create_user(name: str, age: int, email: str):
    cursor.execute('INSERT INTO users (name, age, email) VALUES (?, ?, ?)', (name, age, email))
    conn.commit()
    return {"message": "User created successfully!"}

@app.get("/users")
def get_users():
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    return {"users": users}

# In this file we learnt how to use POST + GET methods + sqlite3 database + create table + insert data into table + retrieve data from table and return it as a response.