# Architektur – Calculator Microservices

Dieses Dokument beschreibt die Architektur des Taschenrechner-Projekts auf Basis von Microservices.

## Services im Überblick

- **registry (7000)**  
  Leichter Discovery-Service. Hält eine Map von Service-Namen auf Basis-URLs und kann von anderen
  Services (insbesondere dem Gateway) abgefragt werden.

- **gateway (8000)**  
  Ein zentrales API-Gateway, das alle externen Requests entgegennimmt und transparent an die
  jeweiligen Microservices weiterleitet.

- **auth (8001)**  
  Kleiner Authentifizierungs-Service. Stellt einen `/login`-Endpoint bereit, der bei korrekten
  Credentials ein Fake-Token ausgibt, sowie `/validate` zur Token-Prüfung.

- **calculator (8002)**  
  Fachlogik für Berechnungen (z.B. Addition, Subtraktion, Multiplikation, Division, Prozent, Wurzel).
  Der Service kennt keine UI und keine Authentifizierung – er rechnet nur.

- **history (8003)**  
  Speichert Berechnungsresultate als History-Einträge und liefert sie bei Bedarf wieder aus.

- **frontend**  
  Next.js/React-Anwendung, die nur mit dem Gateway spricht und nie direkt mit den Backend-Services.

## Kommunikationsdiagramm (ASCII)

```text
+-----------+           +---------------------------+
| Frontend  |  HTTP     |        Gateway (8000)    |
| (Next.js) +---------> |  /auth/...               |
+-----------+           |  /calculate/...          |
                        |  /history/...            |
                        +------------+-------------+
                                     |
                                     | Service-Discovery (optional)
                                     v
                        +---------------------------+
                        |     Registry (7000)      |
                        |  /services/{name}        |
                        +---------------------------+

          +-----------+      +-------------+      +-------------+
          |  Auth     |      | Calculator  |      |  History    |
          |  (8001)   |      |   (8002)    |      |   (8003)    |
          +-----------+      +-------------+      +-------------+
```

## Datenflüsse (Beispiele)

- **Login-Flow**
  1. Frontend → `POST /auth/login` (über Gateway)
  2. Gateway → Auth-Service → Token wird generiert
  3. Token fliesst zurück zum Frontend.

- **Berechnung**
  1. Frontend → `POST /calculate/add` (inkl. Operanden)
  2. Gateway → Calculator-Service → Ergebnis wird berechnet.
  3. Optional sendet das Frontend das Ergebnis an den History-Service (`POST /history`).

