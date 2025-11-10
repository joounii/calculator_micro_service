import os
import json
from http import HTTPStatus
from fastapi import FastAPI, HTTPException, Request, Response
import httpx

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

http_client = httpx.AsyncClient(timeout=10.0)

async def proxy_request(service_base_url: str, request: Request, service_name: str):
    """Handles forwarding the incoming request to the target microservice."""
    
    proxy_headers = dict(request.headers)
    
    proxy_headers.pop('host', None)
    proxy_headers.pop('connection', None)
    
    query_params = dict(request.query_params)
    try:
        request_body = await request.body()
    except Exception:
        request_body = b''

    path_suffix = request.url.path.lstrip(f"/{service_name}")
    full_url = f"{service_base_url}{path_suffix}"

    print(f"[{request.method}] Gateway routing to: {full_url}")

    try:
        response = await http_client.request(
            request.method,
            full_url,
            headers=proxy_headers,
            params=query_params,
            content=request_body,
        )
        
        response_headers = dict(response.headers)
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get("Content-Type", "application/json")
        )

    except httpx.ConnectError:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail=f"Cannot connect to the {service_name.capitalize()} service at {service_base_url}. Is it running?"
        )
    except httpx.HTTPError as e:
        print(f"HTTP Error during forwarding: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail=f"Internal error communicating with {service_name} service."
        )

@app.api_route("/{service_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all_router(service_name: str, path: str, request: Request):
    """
    A unified router that matches the service name prefix and proxies the request.
    
    - Matches paths like: /login/verify, /calculate/add, /history/list
    """
    
    service_name = service_name.lower()
    if service_name not in SERVICE_MAP:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"Service '{service_name}' not found. Available services: {', '.join(SERVICE_MAP.keys())}"
        )

    base_url = SERVICE_MAP[service_name]
    
    auth_header = request.headers.get("Authorization")

    if service_name in ["calculate", "history"] and not auth_header:
        pass
    return await proxy_request(base_url, request, service_name)


@app.get("/")
async def welcome():
    """Simple health check endpoint for the Gateway."""
    return {
        "message": "Calculator API Gateway is running.",
        "services": SERVICE_MAP
    }
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)