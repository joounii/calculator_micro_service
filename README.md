# Calculator Microservices Project

Dieses Repository enthält ein kleines Taschenrechner-System, das als **Microservice-Architektur** umgesetzt ist.
Ziel ist es, die Anforderungen aus Modul 321 (Architektur / Services) und 324 (Docker & Pipelines) nachvollziehbar
an einem konkreten Beispiel zu zeigen.

## Übersicht der Services

Aktuell sind folgende Backend-Services geplant und als eigene Projekte umgesetzt:

| Service      | Port | Aufgabe |
|--------------|------|--------|
| `registry`   | 7000 | Einfache Service-Discovery: verwaltet eine Liste von Service-Namen und Basis-URLs. |
| `gateway`    | 8000 | Einstiegspunkt für alle externen Aufrufe; leitet Requests an die jeweiligen Services weiter. |
| `auth`       | 8001 | Simuliert Login und Token-Validierung. |
| `calculator` | 8002 | Führt die eigentlichen Rechenoperationen aus (Addieren, Subtrahieren, etc.). |
| `history`    | 8003 | Speichert und liefert Berechnungsverläufe. |
| `frontend`   | n/a  | Next.js/React-Frontend, spricht ausschliesslich mit dem `gateway`. |

Damit ist die Vorgabe **„Gateway, Eureka/Discovery, Frontend + weitere Services“** erfüllt.
Mit Registry, Gateway, Auth, Calculator und History existieren **mindestens 5 klar getrennte Microservices**.

## Kommunikationsfluss (vereinfacht)

1. Das **Frontend** sendet HTTP-Requests (z.B. `/calculate/add`) an den **Gateway**.
2. Der **Gateway** fragt – sofern verfügbar – den **Registry-Service** nach der Basis-URL des gewünschten Services
   (z.B. `calculate`, `auth`, `history`) und fällt bei Problemen auf seine statische Konfiguration zurück.
3. Der Gateway leitet den Request an den entsprechenden Microservice weiter:
   - `/auth/...` → Auth-Service
   - `/calculate/...` → Calculator-Service
   - `/history/...` → History-Service
4. Die Antwort des Zielservices wird 1:1 an das Frontend zurückgegeben.

Details dazu finden sich in [`docs/architecture.md`](docs/architecture.md).

## Docker

Für jeden Service gibt es ein eigenes `Dockerfile`. Beispiel:

- `gateway/Dockerfile`
- `auth/Dockerfile`
- `calculator/Dockerfile`
- `history/Dockerfile`
- `registry/Dockerfile`

Beispielhaft existieren bereits Images auf Docker Hub:

- `gateway`: https://hub.docker.com/r/joounii/gateway
- `calculator`: https://hub.docker.com/r/joounii/calculator

Die CI/CD-Pipelines und der Push weiterer Images werden im Rahmen von Modul 324 ergänzt.

