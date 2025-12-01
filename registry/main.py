
from typing import Dict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from http import HTTPStatus
import uvicorn


class ServiceRegistration(BaseModel):
    """Payload for registering a service in the registry."""

    name: str
    url: str


_REGISTRY: Dict[str, str] = {}


app = FastAPI(
    title="Service Registry",
    description=(
        "Lightweight discovery service used by the calculator project. "
        "It allows services to register their base URLs so that the gateway "
        "does not need to rely purely on static configuration."
    ),
    version="1.0.0",
)


@app.post("/register")
async def register_service(reg: ServiceRegistration) -> dict:
    _REGISTRY[reg.name] = reg.url
    return {"message": "registered", "service": reg.name, "url": reg.url}


@app.get("/services")
async def list_services() -> Dict[str, str]:
    return dict(_REGISTRY)


@app.get("/services/{name}")
async def get_service(name: str) -> dict:
    url = _REGISTRY.get(name)
    if not url:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"Service '{name}' is not registered.",
        )
    return {"name": name, "url": url}


@app.delete("/services/{name}")
async def unregister_service(name: str) -> dict:
    existed = _REGISTRY.pop(name, None)
    if not existed:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=f"Service '{name}' is not registered.",
        )
    return {"message": "unregistered", "service": name}


@app.get("/")
async def health() -> dict:
    return {
        "message": "Service Registry is running on port 7000.",
        "registeredServices": list(_REGISTRY.keys()),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7000)
