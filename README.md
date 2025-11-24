# Services: 

## gateway (port 8000)
## auth (port 8001)

## Calculator (port 8002)
### Endpoints
#### Add
Url: localhost:8000/calculate/add
Body: 
```json
{
    "num1": 2,
    "num2": 4
}
```
#### subtract
Url: localhost:8000/calculate/subtract
Body: 
```json
{
    "num1": 10,
    "num2": 3
}
```
#### Multiply
Url: localhost:8000/calculate/multiply
Body: 
```json
{
    "num1": 5,
    "num2": 4
}
```
#### Divide
Url: localhost:8000/calculate/divide
Body: 
```json
{
    "num1": 10,
    "num2": 5
}
```
#### Root
Url: localhost:8000/calculate/root
Body: 
```json
{
    "num1": 16,
    "num2": 2
}
```
## history (port 8003)

## Docker hub repositorys:
https://hub.docker.com/r/joounii/gateway
https://hub.docker.com/r/joounii/calculator