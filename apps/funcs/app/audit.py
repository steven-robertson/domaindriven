import requests
import json
import os
from uuid import UUID
from typing import Optional
from app.file import get_file_text


async def log_audit_event(user_id, table_name, op, json_data) -> Optional[UUID]:
    query = await get_file_text('./graphql/log_audit_event.graphql')

    variables = {
        'user_id': str(user_id) if user_id is not None else None,
        'table_name': table_name,
        'op': op,
        'json_data': json_data
    }

    request = {
        'query': query,
        'variables': variables
    }

    headers = {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': os.environ['HASURA_GRAPHQL_ADMIN_SECRET']
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_audit_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_audit_one')

    if 'audit_id' not in data['data']['insert_audit_one']:
        print(data)
        raise Exception('Missing key: audit_id')

    return data['data']['insert_audit_one']['audit_id']
