
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field
import uvicorn


class HistoryEntry(BaseModel):
    """Single calculation record stored in the history service."""

    operation: str = Field(..., description="Name of the operation, e.g. 'add' or 'divide'.")
    operands: List[float] = Field(..., description="Operands that were used in the calculation.")
    result: float = Field(..., description="Result of the calculation.")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


_HISTORY: List[HistoryEntry] = []


app = FastAPI(
    title="History Service",
    description="Stores and returns calculation history entries.",
    version="1.0.0",
)


@app.post("/history", response_model=HistoryEntry)
async def add_entry(entry: HistoryEntry) -> HistoryEntry:
    """Add a new history entry and return it."""
    _HISTORY.append(entry)
    return entry


@app.get("/history", response_model=List[HistoryEntry])
async def list_history(limit: int = 50) -> List[HistoryEntry]:
    """Return the *limit* most recent entries (default: 50)."""
    if limit <= 0:
        return []
    return _HISTORY[-limit:]


@app.delete("/history")
async def clear_history() -> dict:
    """Remove all stored history entries."""
    count = len(_HISTORY)
    _HISTORY.clear()
    return {"message": "history cleared", "removed": count}


@app.get("/")
async def health() -> dict:
    """Simple health endpoint."""
    return {"message": "History service is running on port 8003.", "entries": len(_HISTORY)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
