import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from http import HTTPStatus

class CalculationData(BaseModel):
    """Data model for the two operands in a calculation."""
    num1: float
    num2: float

app = FastAPI(
    title="Calculator Service",
    description="Performs basic arithmetic operations (Add/Subtract).",
    version="1.0.0"
)

# --- Service Endpoints ---
@app.post("/add")
async def add_numbers(data: CalculationData):
    try:
        result = data.num1 + data.num2
        print(f"Calculation: {data.num1} + {data.num2} = {result}")
        return {"result": result, "operation": "add", "operands": [data.num1, data.num2]}
    except Exception as e:
        print(f"Error during addition: {e}")
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Error processing addition request."
        )

@app.post("/subtract")
async def subtract_numbers(data: CalculationData):
    try:
        result = data.num1 - data.num2
        print(f"Calculation: {data.num1} - {data.num2} = {result}")
        return {"result": result, "operation": "subtract", "operands": [data.num1, data.num2]}
    except Exception as e:
        print(f"Error during subtraction: {e}")
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Error processing subtraction request."
        )
        
@app.post("/multiply")
async def subtract_numbers(data: CalculationData):
    try:
        result = data.num1 * data.num2
        print(f"Calculation: {data.num1} * {data.num2} = {result}")
        return {"result": result, "operation": "multiply", "operands": [data.num1, data.num2]}
    except Exception as e:
        print(f"Error during subtraction: {e}")
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Error processing subtraction request."
        )
        
@app.post("/divide")
async def subtract_numbers(data: CalculationData):
    try:
        result = data.num1 / data.num2
        print(f"Calculation: {data.num1} / {data.num2} = {result}")
        return {"result": result, "operation": "divide", "operands": [data.num1, data.num2]}
    except Exception as e:
        print(f"Error during subtraction: {e}")
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Error processing subtraction request."
        )

@app.get("/")
async def health_check():
    """Simple health check endpoint."""
    return {"message": "Calculator Service is running on port 8002."}

# --- Service Startup ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)