
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
import uvicorn
import uuid

app = FastAPI(
    title="Auth Service",
    description="Handles user authentication (login/register).",
    version="1.0.0",
)

class User(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    password: str

class LoginBody(BaseModel):
    email: str
    password: str

class RegisterBody(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

USERS = {}

default_user_id = str(uuid.uuid4())
USERS["admin@example.com"] = User(
    id=default_user_id,
    email="admin@example.com",
    name="Admin User",
    password="password123"
)

@app.post("/verify")
async def login(body: LoginBody):
    user = USERS.get(body.email)
    if not user or user.password != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = f"token-{user.id}"
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@app.post("/register")
async def register(body: RegisterBody):
    if body.email in USERS:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        email=body.email,
        name=body.name,
        password=body.password
    )
    USERS[body.email] = new_user
    
    token = f"token-{user_id}"
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name
        }
    }

@app.get("/")
async def health():
    return {"message": "Auth Service is running on port 8001."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
