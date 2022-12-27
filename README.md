# Domain-Driven

Domain-Driven Design using PlantUML.

## Fresh Start

These steps assume that you are working in GitHub Codespaces using the Dev Container in this repository.

```bash
export HASURA_GRAPHQL_ADMIN_SECRET=hasurapassword
export MY_HOSTNAME=$(ip -o route get to 8.8.8.8 | sed -n 's/.*src \([0-9.]\+\).*/\1/p')
export DD_FUNCS_BASE_URL=http://${MY_HOSTNAME}:8001
export DD_GRAPHQLAPI_URL=http://${MY_HOSTNAME}:4000/v1/graphql
```

```bash
npm run dev # ctrl-c to quit
```

Launch the URL for the proxied web server on port 8080 (http://localhost:8080).

## Development Notes

### Docker Commands

Remove docker compose deployment to start over:

```bash
docker compose stop && docker compose rm -f
docker volume rm domaindriven_pg_data
```

Refresh and restart docker-compose deployment:

```bash
docker compose pull
docker compose up --build -d
```

### HTTP Local Ports Used

| Port | Purpose             | Protocol |
| ---- | ------------------- | -------- |
| 3000 | PlantUML            | HTTP     |
| 4000 | Hasura GraphQL      | HTTP     |
| 5000 | Auth                | HTTP     |
| 7000 | Auth HTTPS          | HTTPS    |
| 8000 | React               | HTTP     |
| 8001 | FastAPI             | HTTP     |
| 8080 | Proxy               | HTTP     |
