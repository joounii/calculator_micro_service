# main.py (gateway)
import os
import json
from http import HTTPStatus
from fastapi import FastAPI, HTTPException, Request, Response
import httpx
from fastapi.middleware.cors import CORSMiddleware  # <--- neu

SERVICE_MAP = {
    "login": os.environ.get("LOGIN_SERVICE_URL", "http://localhost:8001"),
    "calculate": os.environ.get("CALCULATOR_SERVICE_URL", "http://localhost:8002"),
    "history": os.environ.get("HISTORY_SERVICE_URL", "http://localhost:8003"),
}

app = FastAPI(
    title="Unified Calculator Microservice Gateway",
    description="Routes requests to Login, Calculator, and History services, and handles auth proxying.",
    version="2.0.0"
)

# ✨ CORS erlauben (Next dev: 3000/5173 – ggf. anpassen)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],   # erlaubt u.a. OPTIONS
    allow_headers=["*"],
)

http_client = httpx.AsyncClient(timeout=10.0)

# ...

# ⚠️ OPTIONS hinzufügen, damit Preflight nicht scheitert
@app.api_route("/{service_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def catch_all_router(service_name: str, path: str, request: Request):
    service_name = service_name.lower()
    if service_name not in SERVICE_MAP:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"Service '{service_name}' not found. Available services: {', '.join(SERVICE_MAP.keys())}"
        )

    base_url = SERVICE_MAP[service_name]

    # Preflight direkt positiv beantworten
    if request.method == "OPTIONS":
        return Response(status_code=204)

    # Optionales Auth-Header-Handling
    auth_header = request.headers.get("Authorization")
    if service_name in ["calculate", "history"] and not auth_header:
        pass

    return await proxy_request(base_url, request, service_name)
