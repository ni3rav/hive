# Heyaa Backend

## Setup Instructions

### 1. Setup Postgres with docker

```bash
docker pull postgres:latest
```

```bash
docker run --name heya-postgres -e POSTGRES_PASSWORD=mypassword -d -p 5432:5432 postgres
```

#### Create a `.env` file in `/backend` with following content

```
POSTGRES_PASSWORD="password"
DATABASE_URL="postgres://postgres:password@localhost:5432/postgres"
PORT=3000
```

#### Run following commands to push the schema

```bash
npm run drizzle-push
```

### 3. Run `npm i` followed by `npm run dev` to start local backend

> NOTE: For any db related scripts check scripts from package.json
