from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

todos = []

class Todo(BaseModel):
    id: int
    title: str
    completed: bool


@app.post("/todos")
def create_todo(todo: Todo):
    todos.append(todo)
    return {"message": "Todo created successfully!", "data": todo}


@app.get("/todos")
def get_todos():
    return {"message": "List of todos", "data": todos}


@app.get("/todos/{todo_id}")
def get_todo(todo_id: int):
    for todo in todos:
        if todo.id == todo_id:
            return {"message": "Todo found", "data": todo}
    return {"message": "Todo not found"}


@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: Todo):
    for i, t in enumerate(todos):
        if t.id == todo_id:
            todos[i] = todo
            return {"message": "Todo updated successfully!", "data": todo}
    return {"message": "Todo not found"}


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    for i, t in enumerate(todos):
        if t.id == todo_id:
            deleted_todo = todos.pop(i)
            return {"message": "Todo deleted successfully!", "data": deleted_todo}
    return {"message": "Todo not found"}

# In this file we learnt how to use POST + GET + PUT + DELETE methods + path params + pydantic models + list of todos and how to create, retrieve, update and delete them using respective methods.