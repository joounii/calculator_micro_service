# Calculator Microservice

This document provides an overview of the Calculator Microservice application, including startup instructions, service details, and known issues.

## Overview

The application is a microservice-based calculator composed of the following components:
-   **Gateway**: Unified entry point for all requests.
-   **Auth Service**: Handles user authentication (login/register).
-   **Calculator Service**: Performs arithmetic operations.
-   **History Service**: Stores calculation history.
-   **Frontend**: A Next.js web application.

## Startup Instructions

To run the entire application, you need to start each service and the frontend in separate terminal instances.

### 1. Start the Gateway
```bash
cd gateway
python main.py
```
*Runs on: `http://localhost:8000`*

### 2. Start the Auth Service
```bash
cd auth
python main.py
```
*Runs on: `http://localhost:8001`*

### 3. Start the Calculator Service
```bash
cd calculator
python main.py
```
*Runs on: `http://localhost:8002`*

### 4. Start the History Service
```bash
cd history
python main.py
```
*Runs on: `http://localhost:8003`*

### 5. Start the Frontend
```bash
cd frontend
npm run dev
```
*Runs on: `http://localhost:3000`*

---

## Services & Routes

### Gateway Service
**Base URL:** `http://localhost:8000`
The gateway routes requests to the appropriate microservice based on the path prefix.

| Route | Method | Target Service | Description |
| :--- | :--- | :--- | :--- |
| `/login/*` | Any | Auth Service | Proxies to Auth Service |
| `/calculate/*` | Any | Calculator Service | Proxies to Calculator Service |
| `/history/*` | Any | History Service | Proxies to History Service |
| `/` | GET | Self | Health check |

### Auth Service
**Base URL:** `http://localhost:8001` (Accessed via Gateway at `/login`)

| Route | Method | Description |
| :--- | :--- | :--- |
| `/verify` | POST | User login. Returns a token. |
| `/register` | POST | User registration. |
| `/` | GET | Health check. |

*Default Admin User:*
-   Email: `admin@example.com`
-   Password: `password123`

### Calculator Service
**Base URL:** `http://localhost:8002` (Accessed via Gateway at `/calculate`)

| Route | Method | Description |
| :--- | :--- | :--- |
| `/add` | POST | Addition (`num1 + num2`) |
| `/subtract` | POST | Subtraction (`num1 - num2`) |
| `/multiply` | POST | Multiplication (`num1 * num2`) |
| `/divide` | POST | Division (`num1 / num2`) |
| `/root` | POST | N-th Root (`num1` root `num2`) |
| `/` | GET | Health check. |

### History Service
**Base URL:** `http://localhost:8003` (Accessed via Gateway at `/history`)

| Route | Method | Description |
| :--- | :--- | :--- |
| `/history` | POST | Add a new history entry. |
| `/history` | GET | List recent history entries. |
| `/history` | DELETE | Clear all history. |
| `/` | GET | Health check. |

---

## Known Issues

### History Service
The History Service is currently **unfinished and not fully working**.
I wasn't able to finish the correct frontend implementation of the history service in time

### Pipeline

All the jobs for the services work except for the frontend. The frontend currently is not structured correctly and because of that can't be built. That leads to the github action failing. It's 23:00 and i want too sleep so i won't fix it now because i would have to restrucutre the entire frontend for it to work.



## Docker hub repositorys:
- https://hub.docker.com/r/joounii/gateway
- https://hub.docker.com/r/joounii/history
- https://hub.docker.com/r/joounii/auth
- https://hub.docker.com/r/joounii/calculator
