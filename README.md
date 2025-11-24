Services: 

gateway (port 8000)
auth (port 8001)
calculator (port 8002)

## Endpoints
### Add
### subtract
### Multiply
### Divide
### Root
Url: localhost:8000/calculate/root
Body: 
```json
{
    "num1": 16,
    "num2": 2
}
```
history (port 8003)

Docker hub repositorys:
https://hub.docker.com/r/joounii/gateway
https://hub.docker.com/r/joounii/calculator