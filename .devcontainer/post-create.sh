#!/usr/bin/env bash

# Create .env files from example .env-dist files
cp .env-dist .env
cp apps/proxy/.env-dist apps/proxy/.env

# Use LTS version of Node.js
. ${NVM_DIR}/nvm.sh && nvm install --lts

# Install npm packages
npm install

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Set env vars before starting containers
export HASURA_GRAPHQL_ADMIN_SECRET=hasurapassword
export MY_HOSTNAME=$(ip -o route get to 8.8.8.8 | sed -n 's/.*src \([0-9.]\+\).*/\1/p')
export DD_FUNCS_BASE_URL=http://${MY_HOSTNAME}:8001
export DD_GRAPHQLAPI_URL=http://${MY_HOSTNAME}:4000/v1/graphql

# Start up containers
docker compose up --build -d

# Wait for Hasura to start
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:4000/healthz)" != "200" ]]; do sleep 5; done'

# Apply the seeds
./hasura/seed.sh
