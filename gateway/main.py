
import os
from http import HTTPStatus
from typing import Dict, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request, Response

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Static fallback URLs (e.g. for local development or when the registry is down)
STATIC_SERVICE_MAP: Dict[str, str] = {
    "auth": os.environ.get("AUTH_SERVICE_URL", "http://localhost:8001"),
    "calculate": os.environ.get("CALCULATOR_SERVICE_URL", "http://localhost:8002"),
    "history": os.environ.get("HISTORY_SERVICE_URL", "http://localhost:8003"),
}

SERVICE_REGISTRY_URL = os.environ.get("SERVICE_REGISTRY_URL", "http://localhost:7000")

ALLOWED_SERVICES = set(STATIC_SERVICE_MAP.keys())

app = FastAPI(
    title="Calculator API Gateway",
    description=(
        "Public entry point for the calculator system. "
        "Forwards requests to the Auth, Calculator and History microservices. "
        "Uses a lightweight service registry when available."
    ),
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

async def _lookup_in_registry(service_name: str) -> Optional[str]:
    """Try to resolve the base URL for *service_name* via the registry.

    If the registry is not reachable or the service is unknown, ``None`` is returned.
    """
    if not SERVICE_REGISTRY_URL:
        return None

    url = SERVICE_REGISTRY_URL.rstrip("/") + f"/services/{service_name}"
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            response = await client.get(url)
        if response.status_code != HTTPStatus.OK:
            return None
        payload = response.json()
        # we expect either { "url": "http://..." } or { "name": "...", "url": "http://..." }
        if isinstance(payload, dict):
            service_url = payload.get("url")
            if isinstance(service_url, str):
                return service_url
    except Exception:
        # Registry not available → caller will fall back to STATIC_SERVICE_MAP
        return None

    return None


async def get_service_base_url(service_name: str) -> str:
    """Resolve the base URL for *service_name*.

    1. Try the registry.
    2. Fall back to the static configuration.
    """
    if service_name not in ALLOWED_SERVICES:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"Unknown service '{service_name}'.",
        )

    # 1) Try registry
    registry_url = await _lookup_in_registry(service_name)
    if registry_url:
        return registry_url.rstrip("/")

    # 2) Fallback to static map
    base_url = STATIC_SERVICE_MAP.get(service_name)
    if not base_url:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail=f"No base URL configured for service '{service_name}'.",
        )

    return base_url.rstrip("/")


async def proxy_request(service_name: str, request: Request, path: str) -> Response:
    """Generic reverse proxy.

    Forwards the incoming *request* to the resolved *service_name* and *path*.
    """
    base_url = await get_service_base_url(service_name)
    target_url = f"{base_url}/{path}".rstrip("/")

    # Clone incoming request
    method = request.method
    query_params = dict(request.query_params)
    headers = dict(request.headers)
    # Host header should be removed so the downstream service can set its own
    headers.pop("host", None)

    body = await request.body()

    async with httpx.AsyncClient(follow_redirects=False) as client:
        upstream_response = await client.request(
            method=method,
            url=target_url,
            params=query_params,
            headers=headers,
            content=body,
        )

    # Build response to caller
    # Copy headers but drop hop-by-hop headers that can cause issues
    excluded_headers = {"content-length", "transfer-encoding", "connection", "keep-alive"}
    response_headers = {
        k: v
        for k, v in upstream_response.headers.items()
        if k.lower() not in excluded_headers
    }

    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.api_route(
    "/{service_name}/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
)
async def gateway_proxy(service_name: str, path: str, request: Request) -> Response:
    """Entry point for all proxied service calls.

    Example: ``/calculate/add`` → forwards to the Calculator service.
    """
    return await proxy_request(service_name, request, path or "")


@app.get("/")
async def root() -> Dict[str, object]:
    """Simple health check and configuration overview."""
    return {
        "message": "Calculator API Gateway is running.",
        "allowedServices": sorted(ALLOWED_SERVICES),
        "staticServiceMap": STATIC_SERVICE_MAP,
        "serviceRegistryUrl": SERVICE_REGISTRY_URL,
    }


# ---------------------------------------------------------------------------
# Local development entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
