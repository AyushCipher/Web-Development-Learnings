from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi import FastAPI, HTTPException

DATABASE_URL="sqlite:///mydatabase.db"

# Creates a base class from which your database models will inherit
Base = declarative_base()

# Create the database engine and session
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# sessionmaker creates a factory for database sessions so that we can use to interact with the database
Session = sessionmaker(bind=engine)

# FastAPI application instance
app = FastAPI()

# Create the database tables
class Todo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    status = Column(String, default="pending")

# Create tables in the database
Base.metadata.create_all(bind=engine)

# Get all todo items
@app.get("/todos")
def get_todos():
    session = Session()
    todos = session.query(Todo).all()
    session.close()
    return {"todos": [{"id": todo.id, "title": todo.title, "description": todo.description, "status": todo.status} for todo in todos]}


# Get a specific todo item by its ID
@app.get("/todos/{todo_id}")
def get_todo(todo_id: int):
    session = Session()
    todo = session.query(Todo).filter(Todo.id == todo_id).first()
    session.close()
    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"todo": {"id": todo.id, "title": todo.title, "description": todo.description, "status": todo.status}}


# Create a new todo item
@app.post("/todos")
def create_todo(title: str, description: str):
    session = Session()
    new_todo = Todo(title=title, description=description)
    session.add(new_todo)
    session.commit()
    session.refresh(new_todo)
    session.close()
    return {"message": "Task created successfully!", "todo": {"id": new_todo.id, "title": new_todo.title, "description": new_todo.description, "status": new_todo.status}}


# Update the title and description of a todo item by its ID
@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, title: str, description: str):
    session = Session()
    todo = session.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        session.close()
        raise HTTPException(status_code=404, detail="Task not found")
    todo.title = title
    todo.description = description
    session.commit()
    session.refresh(todo)
    session.close()
    return {"message": "Task updated successfully!", "todo": {"id": todo.id, "title": todo.title, "description": todo.description, "status": todo.status}}


# Delete a todo item by its ID
@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    session = Session()
    todo = session.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        session.close()
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(todo)
    session.commit()
    session.close()
    return {"message": "Task deleted successfully!"}

# In this file we learnt how to use POST + GET + PUT + DELETE methods + path params + pydantic models + list of todos and how to create, retrieve, update and delete them through SqlAlchemy database using Restful FastAPI methods.