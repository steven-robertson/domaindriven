import requests
import json
import os
from uuid import UUID
from typing import Optional
from app.file import get_file_text


async def add_user_to_space(user_id: UUID, space_id: UUID) -> Optional[UUID]:
    query = await get_file_text('./graphql/add_user_to_space.graphql')

    variables = {
        'user_id': str(user_id),
        'space_id': str(space_id)
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

    if 'insert_user_space_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_user_space_one')

    if 'user_id' not in data['data']['insert_user_space_one']:
        print(data)
        raise Exception('Missing key: user_id')

    return data['data']['insert_user_space_one']['user_id']
