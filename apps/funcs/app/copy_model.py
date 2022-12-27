import requests
import json
import os
from typing import Optional, Dict, Any
from uuid import UUID
from app.file import get_file_text


async def copy_model(model, space_id: UUID, name: str, headers) -> Optional[UUID]:
    new_model_id = await create_new_model(name, space_id, headers)
    contexts_lookup = {}
    if 'contexts' in model:
        for context in model['contexts']:
            notes = context['notes'] if 'notes' in context else None
            old_context_id = context['context_id']
            context_name = context['name']
            new_context_id = await create_new_context(context_name, notes, new_model_id, headers)
            contexts_lookup[old_context_id] = new_context_id
            terms_lookup = await copy_terms_to_context(context, new_context_id, headers)
            await copy_demoteds_to_context(context, new_context_id, terms_lookup, headers)
            await copy_relations_to_context(context, new_context_id, terms_lookup, headers)
            await copy_groups_to_context(context, new_context_id, terms_lookup, headers)
    await copy_connections(model, new_model_id, contexts_lookup, headers)
    return new_model_id


async def create_new_model(name: str, space_id: UUID, headers) -> Optional[UUID]:
    query = await get_file_text('./graphql/create_new_model.graphql')

    variables = {
        'name': name,
        'space_id': str(space_id)
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_model_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_model_one')

    if 'model_id' not in data['data']['insert_model_one']:
        print(data)
        raise Exception('Missing key: model_id')

    return data['data']['insert_model_one']['model_id']


async def create_new_context(name: str, notes: str, model_id: UUID, headers) -> Optional[UUID]:
    query = await get_file_text('./graphql/create_new_context.graphql')

    variables = {
        'name': name,
        'notes': notes,
        'model_id': str(model_id)
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_context_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_context_one')

    if 'context_id' not in data['data']['insert_context_one']:
        print(data)
        raise Exception('Missing key: context_id')

    return data['data']['insert_context_one']['context_id']


async def copy_terms_to_context(context, context_id: UUID, headers) -> Dict[Any, Optional[UUID]]:
    terms_lookup = {}
    if 'terms' in context:
        for term in context['terms']:
            term_id = term['term_id']
            name = term['name']
            classname = term['classname']
            definition = term['definition']
            todo = term['todo']
            enabled = term['enabled']
            new_term_id = await create_term(context_id, name, classname, definition, todo, enabled, headers)
            terms_lookup[term_id] = new_term_id
    return terms_lookup


async def copy_demoteds_to_context(context, context_id: UUID, terms_lookup, headers) -> None:
    if 'demoteds' in context:
        for term in context['demoteds']:
            term_id = terms_lookup[term['term_id']]
            demoted_name = term['demoted_name']
            await create_demoted(context_id, term_id, demoted_name, headers)


async def copy_relations_to_context(context, context_id: UUID, terms_lookup, headers) -> None:
    if 'relations' in context:
        for relation in context['relations']:
            from_term_id = terms_lookup[relation['from_term_id']]
            to_term_id = terms_lookup[relation['to_term_id']]
            from_multiplier_id = relation['from_multiplier_id']
            to_multiplier_id = relation['to_multiplier_id']
            await create_relation(
                context_id,
                from_term_id,
                to_term_id,
                from_multiplier_id,
                to_multiplier_id,
                headers)


async def copy_groups_to_context(context, context_id: UUID, terms_lookup, headers) -> None:
    if 'groups' in context:
        for group in context['groups']:
            name = group['name']
            description = group['description']
            group_id = await create_group(context_id, name, description, headers)
            for entry in group['group_terms']:
                term = entry['term']
                term_id = terms_lookup[term['term_id']]
                await add_term_to_group(term_id, group_id, headers)


async def copy_connections(model, model_id: UUID, contexts_lookup, headers) -> None:
    if 'connections' in model:
        for connection in model['connections']:
            from_context_id = contexts_lookup[connection['from_context_id']]
            to_context_id = contexts_lookup[connection['to_context_id']]
            await create_connection(model_id, from_context_id, to_context_id, headers)


async def create_term(context_id: UUID, name: str, classname: str, definition: str,
                      todo: bool, enabled: bool, headers) -> Optional[UUID]:

    query = await get_file_text('./graphql/create_term.graphql')

    variables = {
        'context_id': str(context_id),
        'name': name,
        'classname': classname,
        'definition': definition,
        'todo': str(todo),
        'enabled': str(enabled)
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_term_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_term_one')

    if 'term_id' not in data['data']['insert_term_one']:
        print(data)
        raise Exception('Missing key: term_id')

    return data['data']['insert_term_one']['term_id']


async def create_demoted(context_id: UUID, term_id: UUID, demoted_name: str, headers) -> Optional[UUID]:
    query = await get_file_text('./graphql/create_demoted.graphql')

    variables = {
        'context_id': str(context_id),
        'term_id': str(term_id),
        'demoted_name': demoted_name,
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_demoted_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_demoted_one')

    if 'demoted_id' not in data['data']['insert_demoted_one']:
        print(data)
        raise Exception('Missing key: demoted_id')

    return data['data']['insert_demoted_one']['demoted_id']


async def create_relation(context_id: UUID,
                          from_term_id: UUID,
                          to_term_id: UUID,
                          from_multiplier_id: UUID,
                          to_multiplier_id: UUID,
                          headers) -> Optional[UUID]:

    query = await get_file_text('./graphql/create_relation.graphql')

    variables = {
        'context_id': str(context_id),
        'from_term_id': str(from_term_id),
        'to_term_id': str(to_term_id),
        'from_multiplier_id': str(from_multiplier_id) if from_multiplier_id is not None else None,
        'to_multiplier_id': str(to_multiplier_id) if to_multiplier_id is not None else None
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_relation_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_relation_one')

    if 'relation_id' not in data['data']['insert_relation_one']:
        print(data)
        raise Exception('Missing key: relation_id')

    return data['data']['insert_relation_one']['relation_id']


async def create_group(context_id: UUID, name: str, description: str, headers) -> Optional[UUID]:
    query = await get_file_text('./graphql/create_group.graphql')

    variables = {
        'context_id': str(context_id),
        'name': name,
        'description': description
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_group_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_group_one')

    if 'group_id' not in data['data']['insert_group_one']:
        print(data)
        raise Exception('Missing key: group_id')

    return data['data']['insert_group_one']['group_id']


async def create_connection(model_id: UUID, from_context_id: UUID, to_context_id: UUID, headers) -> Optional[UUID]:
    query = await get_file_text('./graphql/create_connection.graphql')

    variables = {
        'model_id': str(model_id),
        'from_context_id': str(from_context_id),
        'to_context_id': str(to_context_id)
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_connection_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_connection_one')

    if 'connection_id' not in data['data']['insert_connection_one']:
        print(data)
        raise Exception('Missing key: connection_id')

    return data['data']['insert_connection_one']['connection_id']


async def add_term_to_group(term_id: UUID, group_id: UUID, headers) -> None:
    query = await get_file_text('./graphql/add_term_to_group.graphql')

    variables = {
        'term_id': str(term_id),
        'group_id': str(group_id)
    }

    request = {
        'query': query,
        'variables': variables
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_group_term_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_group_term_one')

    if 'group_id' not in data['data']['insert_group_term_one']:
        print(data)
        raise Exception('Missing key: group_id')
