from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.staticfiles import StaticFiles
import os
import shutil 

app = FastAPI()

UPLOAD_DIR = "static/uploads"


# Ensure the upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


# Static files configuration
app.mount("/static", StaticFiles(directory="static"), name="static")


# Endpoint to handle file uploads
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "File uploaded successfully", "file_name": file.filename}


# Get the list of uploaded files
@app.get("/files")
def list_uploaded_files():
    files = os.listdir(UPLOAD_DIR)
    return {"uploaded_files": files}


# Get a specific uploaded file
@app.get("/files/{file_name}")
def get_uploaded_file(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return {"file_name": file_name, "file_path": f"/static/uploads/{file_name}"}


# In this file, we have implemented a FastAPI application that allows users to upload files and retrieve them. The application has the following features:
# 1. An endpoint to handle file uploads, saving the files to a designated directory.
# 2. An endpoint to list all uploaded files.
# 3. An endpoint to retrieve a specific uploaded file.