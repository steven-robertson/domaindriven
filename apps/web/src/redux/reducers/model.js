import {actionTypes} from "../actions/model";
import {getModelViewers} from "../../model_viewers";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * id: string,
 * name: string,
 * space: Object,
 * spaceId: string,
 * viewers: Object[],
 * viewerIds: string[],
 * viewerIdLookup: Object,
 * contexts: Object[],
 * contextsLookup: Object[],
 * connections: Object[]
 * }}
 */
const initialState = {
    id: undefined,
    name: undefined,
    space: undefined,
    spaceId: undefined,
    viewers: undefined,
    viewerIds: undefined,
    viewerIdLookup: undefined,
    contexts: undefined,
    contextsLookup: undefined,
    connections: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveModelQueryResult(state, action) {

    // noinspection JSUnresolvedVariable
    const model = action.result?.model_by_pk;
    console.assert(model != null, 'result is null');

    // noinspection JSUnresolvedVariable
    const viewers = model.model_viewers;
    const {viewerIds, viewerIdLookup} = getModelViewers(viewers);

    // Build contexts lookup.
    const contexts = model.contexts;
    const contextsLookup = {};
    for (let i = 0; i < contexts.length; i++) {
        const context = contexts[i];
        contextsLookup[context.context_id] = context;
    }

    return {
        ...state,
        id: model.model_id,
        name: model.name,
        space: model.space.name,
        spaceId: model.space.space_id,
        viewers,
        viewerIds,
        viewerIdLookup,
        contexts,
        contextsLookup,
        connections: model.connections
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.reset]: reset,
    [actionTypes.receiveModelQueryResult]: receiveModelQueryResult,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
