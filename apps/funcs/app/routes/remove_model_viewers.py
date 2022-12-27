from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
from app.file import get_file_text
import requests
import json
import os


remove_model_viewers = APIRouter()


@remove_model_viewers.post("/", response_model=None)
async def handle() -> None:
    query = await get_file_text('./graphql/remove_model_viewers.graphql')

    timeout_minutes = 3

    dt = datetime.now(timezone.utc)
    delta = timedelta(minutes=timeout_minutes)
    dt = dt - delta

    variables = {
        'updated_at': str(dt)
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

    if 'delete_model_viewer' not in data['data']:
        print(data)
        raise Exception('Missing key: delete_model_viewer')

    if 'affected_rows' not in data['data']['delete_model_viewer']:
        print(data)
        raise Exception('Missing key: affected_rows')

    removed_records = int(data['data']['delete_model_viewer']['affected_rows'])
    if removed_records > 0:
        print(f'Removed {removed_records} people from viewing models after {timeout_minutes} minutes')

    return None
