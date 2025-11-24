import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from http import HTTPStatus
import math

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
async def multiply_numbers(data: CalculationData):
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
async def divide_numbers(data: CalculationData):
    
    if data.num2 == 0:
        print(f"Error during division: Division by zero attempted with {data.num1} / {data.num2}")
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Cannot divide by zero."
        )
    
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
        
@app.post("/root")
async def calculate_root(data: CalculationData):
    """
    num1 is the number (base), num2 is the root (degree).
    """
    number = data.num1
    root = data.num2
    
    if root == 0:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="Cannot calculate the 0th root. The root degree must not be zero."
        )
        
    exponent = 1 / root 

    try:
        result: float
        if number >= 0:
            result = math.pow(number, exponent)
        else:
            is_odd_integer_root = root % 2 != 0
            if is_odd_integer_root:
                result = -math.pow(abs(number), exponent)
            else:
                raise ValueError("Cannot calculate a real root for a negative number with an even root.")
        
        print(f"Calculation: {root} root of {number} = {result}")
        return {
            "result": result, 
            "operation": f"{root} root", 
            "operands": [number, root]
        }
    
    except ValueError as ve:
        print(f"Error during root calculation: {ve}")
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        print(f"Error during root calculation: {e}")
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during root calculation."
        )

@app.get("/")
async def health_check():
    """Simple health check endpoint."""
    return {"message": "Calculator Service is running on port 8002."}

# --- Service Startup ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)