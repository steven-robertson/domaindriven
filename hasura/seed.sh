#!/usr/bin/env bash

# Hasura CLI needs admin secret
export HASURA_GRAPHQL_ADMIN_SECRET=hasurapassword

# Change to the directory containing this script
cd $(dirname "$0")

# Apply seeds
cd ./seeds/default/
hasura seed apply --database-name default --file *_space_seed.sql
hasura seed apply --database-name default --file *_user_seed.sql
hasura seed apply --database-name default --file *_user_space_seed.sql
