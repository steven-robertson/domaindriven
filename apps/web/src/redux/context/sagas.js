import {takeLatest, select, put, call} from "redux-saga/effects";
import gql from "graphql-tag";
import combineQuery from "graphql-combine-query";
import {
    actionTypes,
    receiveContextQueryResult,
    reset,
    subscribeToContext,
    subscribeToContextCallback,
} from "./actions";
import {
    subscribe,
    subscribeAction,
    unsubscribeAction,
} from "../subscriber/actions";
import {handleError, handleException, handleWebsocketCallbackError} from "../../errors";
import {gqlFetch} from "../../graphql_fetch";
import {isDuplicated as isTermDuplicated, isSameTerm} from "../../components/actions/term/AddTermAction";
import {isDuplicated as isRelationDuplicated} from "../../components/actions/relation/AddRelationAction";
import {viewUpsert} from "../model/actions";

// -----------------------------------------------------------------------------
// Action watchers
// -----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToContextActions() {
    yield takeLatest(actionTypes.subscribeToContext, handleSubscribeToContext);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToContextCallbackActions() {
    yield takeLatest(actionTypes.subscribeToContextCallback, handleSubscribeToContextCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromContextActions() {
    yield takeLatest(actionTypes.unsubscribeFromContext, handleUnsubscribeFromContext);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddContextActions() {
    yield takeLatest(actionTypes.addContext, handleAddContext);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveContextActions() {
    yield takeLatest(actionTypes.removeContext, handleRemoveContext);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRenameContextActions() {
    yield takeLatest(actionTypes.renameContext, handleRenameContext);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddTermActions() {
    yield takeLatest(actionTypes.addTerm, handleAddTerm);
}

// noinspection JSUnusedGlobalSymbols
export function* watchEditTermActions() {
    yield takeLatest(actionTypes.editTerm, handleEditTerm);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveTermActions() {
    yield takeLatest(actionTypes.removeTerm, handleRemoveTerm);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddDemotedTermActions() {
    yield takeLatest(actionTypes.addDemotedTerm, handleAddDemotedTerm);
}

// noinspection JSUnusedGlobalSymbols
export function* watchEditDemotedTermActions() {
    yield takeLatest(actionTypes.editDemotedTerm, handleEditDemotedTerm);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveDemotedTermActions() {
    yield takeLatest(actionTypes.removeDemotedTerm, handleRemoveDemotedTerm);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddGroupActions() {
    yield takeLatest(actionTypes.addGroup, handleAddGroup);
}

// noinspection JSUnusedGlobalSymbols
export function* watchEditGroupActions() {
    yield takeLatest(actionTypes.editGroup, handleEditGroup);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveGroupActions() {
    yield takeLatest(actionTypes.removeGroup, handleRemoveGroup);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddRelationActions() {
    yield takeLatest(actionTypes.addRelation, handleAddRelation);
}

// noinspection JSUnusedGlobalSymbols
export function* watchEditRelationActions() {
    yield takeLatest(actionTypes.editRelation, handleEditRelation);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveRelationActions() {
    yield takeLatest(actionTypes.removeRelation, handleRemoveRelation);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSetTermsEnabledActions() {
    yield takeLatest(actionTypes.setTermsEnabled, handleSetTermsEnabled);
}

// noinspection JSUnusedGlobalSymbols
export function* watchImportTermsActions() {
    yield takeLatest(actionTypes.importTerms, handleImportTerms);
}

// noinspection JSUnusedGlobalSymbols
export function* watchEditNotesActions() {
    yield takeLatest(actionTypes.editNotes, handleEditNotes);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleSubscribeToContext(action) {
    try {
        const query = gql`
            subscription ($context_id: uuid!) {
                context_by_pk(context_id: $context_id) {
                    context_id
                    name
                    notes
                    model_id
                    model {
                        model_id
                        name
                        model_viewers {
                            user_id
                            user {
                                user_id
                                name
                            }
                        }
                        space {
                            space_id
                            name
                        }
                    }
                    terms(order_by: {enabled: desc, name: asc}) {
                        term_id
                        name
                        classname
                        definition
                        todo
                        enabled
                        demoteds {
                            demoted_name
                        }
                    }
                    groups(order_by: {name: asc}) {
                        group_id
                        name
                        description
                        group_terms {
                            term {
                                term_id
                                name
                            }
                        }
                    }
                    relations {
                        relation_id
                        from_term_id
                        from_multiplier_id
                        multiplierByFromMultiplierId {
                            symbol
                        }
                        to_term_id
                        to_multiplier_id
                        multiplierByToMultiplierId {
                            symbol
                        }
                    }
                    demoteds(order_by: {demoted_name: asc}) {
                        demoted_id
                        demoted_name
                        term_id
                    }
                }
            }
        `;

        const variables = {
            context_id: action.id
        };

        yield put(subscribe(action, query, variables, subscribeToContextCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToContextCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        // noinspection JSUnresolvedVariable
        if (!data.context_by_pk) {
            handleError('Context not found');
            return;
        }

        yield put(receiveContextQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromContext() {
    yield put(unsubscribeAction(subscribeToContext(undefined)));
    yield put(reset());
}

function* handleAddContext(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($name: String!, $model_id: uuid!) {
                insert_context_one(object: {name: $name, model_id: $model_id}) {
                    context_id
                }
            }
        `;

        const variables = {
            'name': action.name,
            'model_id': modelId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        const contextId = response?.data?.insert_context_one?.context_id;
        console.assert(contextId, response);

        // TODO: Redirect to the new context page.
        // if (modelId) {
        //     action.navigate(`/models/${modelId}`);
        // }

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveContext(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        const query = gql`
            mutation ($context_id: uuid!) {
                delete_context_by_pk(context_id: $context_id) {
                    context_id
                }
            }
        `;

        const variables = {
            'context_id': action.contextId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_context_by_pk?.context_id === action.contextId, response);

        // Redirect to model page.
        action.navigate(`/models/${modelId}`);

    } catch (e) {
        handleException(e);
    }
}

function* handleRenameContext(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($context_id: uuid!, $name: String!) {
                update_context_by_pk(pk_columns: {context_id: $context_id}, _set: {name: $name}) {
                    context_id
                }
            }
        `;

        const variables = {
            'context_id': action.contextId,
            'name': action.name
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_context_by_pk?.context_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleAddTerm(action) {
    try {
        const groupsEnabled = yield select((state) => state.model.groupsEnabled);

        const termId = yield addTerm(
            action.contextId,
            action.name,
            action.classname,
            action.incomplete,
            action.definition);

        // If term added when groups are enabled then add term to enabled groups.
        if (groupsEnabled && groupsEnabled.length > 0) {
            for (let i = 0; i < groupsEnabled.length; i++) {
                const groupId = groupsEnabled[i];
                yield addTermToGroup(termId, groupId);
            }
        }

    } catch (e) {
        handleException(e);
    }
}

function* handleEditTerm(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation (
                $term_id: uuid!, 
                $name: String!, 
                $classname: String!,
                $todo: Boolean,
                $definition: String!) {
                update_term_by_pk(pk_columns: {term_id: $term_id},
                    _set: {
                        name: $name, 
                        classname: $classname, 
                        todo: $todo,
                        definition: $definition}) {
                    term_id
                }
            }
        `;

        const variables = {
            'term_id': action.termId,
            'name': action.name,
            'classname': action.classname,
            'todo': action.incomplete,
            'definition': action.definition
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_term_by_pk?.term_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveTerm(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($term_id: uuid!) {
                delete_term_by_pk(term_id: $term_id) {
                    term_id
                }
            }
        `;

        const variables = {
            'term_id': action.termId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_term_by_pk?.term_id === action.termId, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleAddDemotedTerm(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation (
                $context_id: uuid!,
                $demoted_name: String!,
                $term_id: uuid!) {
                insert_demoted_one(object: {
                    context_id: $context_id,
                    demoted_name: $demoted_name, 
                    term_id: $term_id}) {
                    demoted_id
                }
            }
        `;

        const variables = {
            'context_id': action.contextId,
            'demoted_name': action.name,
            'term_id': action.termId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.insert_demoted_one?.demoted_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleEditDemotedTerm(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($demoted_id: uuid!, $demoted_name: String!, $term_id: uuid!) {
                update_demoted_by_pk(pk_columns: {demoted_id: $demoted_id},
                    _set: {demoted_name: $demoted_name, term_id: $term_id}) {
                    demoted_id
                }
            }
        `;

        const variables = {
            'demoted_id': action.demotedId,
            'demoted_name': action.name,
            'term_id': action.termId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_demoted_by_pk?.demoted_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveDemotedTerm(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($demoted_id: uuid!) {
                delete_demoted_by_pk(demoted_id: $demoted_id) {
                    demoted_id
                }
            }
        `;

        const variables = {
            'demoted_id': action.demotedId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_demoted_by_pk?.demoted_id === action.demotedId, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleAddGroup(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const insertGroupQuery = gql`
            mutation (
                $context_id: uuid!, 
                $name: String!, 
                $description: String!) {
                insert_group_one(object: {
                    context_id: $context_id, 
                    name: $name,
                    description: $description}) {
                    group_id
                }
            }
        `;

        const insertGroupQueryVariables = {
            'context_id': action.contextId,
            'name': action.name,
            'description': action.description
        };

        // NOTE: Need group_id to insert group_term entries, so call the insert query first.
        let response = yield call(gqlFetch, userId, insertGroupQuery, insertGroupQueryVariables);

        // Additional queries only if there are selected terms.
        if (action.enabledTerms.length > 0) {

            // noinspection JSUnresolvedVariable
            const groupId = response?.data?.insert_group_one?.group_id;
            console.assert(groupId, response);
            if (!groupId) {
                // noinspection ExceptionCaughtLocallyJS
                throw 'no group id';
            }

            const insertGroupTermsQuery = gql`
                mutation ($group_id: uuid!, $term_id: uuid!) {
                    insert_group_term_one(object: {group_id: $group_id, term_id: $term_id}) {
                        term_id
                    }
                }
            `;

            const insertGroupTermsQueryVariables = [];
            for (let i = 0; i < action.enabledTerms.length; i++) {
                const termId = action.enabledTerms[i];
                insertGroupTermsQueryVariables.push({group_id: groupId, term_id: termId});
            }

            const {document, variables} = (() =>
                combineQuery('AddGroupTerms')
                    .addN(insertGroupTermsQuery, insertGroupTermsQueryVariables))();

            response = yield call(gqlFetch, userId, document, variables);

            // noinspection JSUnresolvedVariable
            console.assert(response?.data?.insert_group_term_one_0?.term_id, response);
        }

    } catch (e) {
        handleException(e);
    }
}

function* handleEditGroup(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const updateGroupQuery = gql`
            mutation (
                $update_group_id: uuid!, 
                $name: String!, 
                $description: String!) {
                update_group_by_pk(pk_columns: {group_id: $update_group_id},
                    _set: {
                        name: $name, 
                        description: $description}) {
                    group_id
                }
            }
        `;

        const updateGroupQueryVariables = {
            'update_group_id': action.groupId,
            'name': action.name,
            'description': action.description
        };

        const deleteGroupTerms = gql`
            mutation ($delete_group_id: uuid!) {
                delete_group_term(where: {group_id: {_eq: $delete_group_id}}) {
                    affected_rows
                }
            }
        `;

        const deleteGroupTermsVariables = {
            'delete_group_id': action.groupId
        };

        const insertGroupTermsQuery = gql`
            mutation ($term_group_id: uuid!, $term_id: uuid!) {
                insert_group_term_one(object: {group_id: $term_group_id, term_id: $term_id}) {
                    term_id
                }
            }
        `;

        const insertGroupTermsQueryVariables = [];
        for (let i = 0; i < action.enabledTerms.length; i++) {
            const termId = action.enabledTerms[i];
            insertGroupTermsQueryVariables.push({term_group_id: action.groupId, term_id: termId});
        }

        const {document, variables} = (() =>
            combineQuery('EditGroup')
                .add(updateGroupQuery, updateGroupQueryVariables)
                .add(deleteGroupTerms, deleteGroupTermsVariables)
                .addN(insertGroupTermsQuery, insertGroupTermsQueryVariables))();

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, document, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_group_by_pk?.group_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveGroup(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const deleteGroupQuery = gql`
            mutation ($group_id: uuid!) {
                delete_group_by_pk(group_id: $group_id) {
                    group_id
                }
            }
        `;

        const deleteGroupQueryVariables = {
            'group_id': action.groupId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, deleteGroupQuery, deleteGroupQueryVariables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_group_by_pk?.group_id === action.groupId, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleAddRelation(action) {
    try {
        yield addRelation(
            action.contextId,
            action.fromTermId,
            action.fromMultiplierId,
            action.toTermId,
            action.toMultiplierId);
    } catch (e) {
        handleException(e);
    }
}

function* handleEditRelation(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($relation_id: uuid!, 
                $from_term_id: uuid!, $from_multiplier_id: uuid!, 
                $to_term_id: uuid!, $to_multiplier_id: uuid!) {
                update_relation_by_pk(pk_columns: {relation_id: $relation_id},
                    _set: {
                        from_term_id: $from_term_id, from_multiplier_id: $from_multiplier_id,
                        to_term_id: $to_term_id, to_multiplier_id: $to_multiplier_id
                    }) {
                    relation_id
                }
            }
        `;

        const variables = {
            'relation_id': action.relationId,
            'from_term_id': action.fromTermId,
            'from_multiplier_id': action.fromMultiplierId,
            'to_term_id': action.toTermId,
            'to_multiplier_id': action.toMultiplierId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_relation_by_pk?.relation_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveRelation(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($relation_id: uuid!) {
                delete_relation_by_pk(relation_id: $relation_id) {
                    relation_id
                }
            }
        `;

        const variables = {
            'relation_id': action.relationId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_relation_by_pk?.relation_id === action.relationId, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleSetTermsEnabled(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const updateQuery = gql`
            mutation ($term_id: uuid!, $enabled: Boolean) {
                update_term_by_pk(pk_columns: {term_id: $term_id}, _set: {enabled: $enabled}) {
                    term_id
                }
            }
        `;

        const updateQueryVariables = [];
        for (let i = 0; i < action.termIds.length; i++) {
            const termId = action.termIds[i];
            updateQueryVariables.push({term_id: termId, enabled: action.enabled});
        }

        const {document, variables} = (() =>
            combineQuery('SetTermsEnabled')
                .addN(updateQuery, updateQueryVariables))();

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, document, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_term_by_pk?.term_id === action.termId, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleImportTerms(action) {
    try {
        const terms = yield select((state) => state.context.terms);
        const relations = yield select((state) => state.context.relations);
        const contextId = yield select((state) => state.context.id);
        console.assert(contextId === action.contextId);

        const srcTerms = action.terms;
        const srcRelations = action.relations;

        // Maps src term ID to new term ID.
        const termIdLookup = {};

        // Import terms.
        for (let i = 0; i < srcTerms.length; i++) {
            const srcTerm = srcTerms[i];

            let termId;

            // Check if the term already exists in the model.
            if (isTermDuplicated(terms, srcTerm.name)) {
                const term = getTerm(terms, srcTerm.name);

                // noinspection JSUnresolvedVariable
                termId = term.term_id;

                // noinspection JSUnresolvedVariable
                const definition = term.definition;

                // Append the definition, and mark as to be completed.
                yield updateTermDefinition(termId, true, definition
                    ? `${definition}\n\n---\n\n${srcTerm.definition}`
                    : srcTerm.definition);

            } else {
                termId = yield addTerm(
                    contextId,
                    srcTerm.name,
                    srcTerm.classname,
                    srcTerm.todo,
                    srcTerm.definition);
            }

            // Map src term ID to new term ID.
            termIdLookup[srcTerm.term_id] = termId;
        }

        // Import relations.
        for (let i = 0; i < srcRelations.length; i++) {
            const srcRelation = srcRelations[i];
            const fromTermId = termIdLookup[srcRelation.from_term_id];
            const toTermId = termIdLookup[srcRelation.to_term_id];
            if (!isRelationDuplicated(relations, fromTermId, toTermId)) {
                yield addRelation(
                    contextId,
                    fromTermId,
                    srcRelation.fromMultiplierId || null,
                    toTermId,
                    srcRelation.toMultiplierId || null);
            }
        }

    } catch (e) {
        handleException(e);
    }
}

function* handleEditNotes(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($context_id: uuid!, $notes: String!) {
                update_context_by_pk(pk_columns: {context_id: $context_id}, _set: {notes: $notes}) {
                    context_id
                }
            }
        `;

        const variables = {
            'context_id': action.contextId,
            'notes': action.notes
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_context_by_pk?.context_id, response);

    } catch (e) {
        handleException(e);
    }
}

// -----------------------------------------------------------------------------
// Supporting code
// -----------------------------------------------------------------------------

/**
 * @param contextId {string}
 * @param name {string}
 * @param classname {string}
 * @param incomplete {boolean}
 * @param definition {string}
 * @return {string} Term UUID
 */
function* addTerm(contextId, name, classname, incomplete, definition) {
    const userId = yield select((state) => state.user.userId);
    const modelId = yield select((state) => state.model.id);

    // Update timestamp for interaction with model.
    yield put(viewUpsert(modelId));

    const query = gql`
        mutation (
            $context_id: uuid!,
            $name: String!,
            $classname: String!,
            $todo: Boolean,
            $definition: String!) {
            insert_term_one(object: {
                context_id: $context_id,
                name: $name,
                classname: $classname,
                todo: $todo,
                definition: $definition}) {
                term_id
            }
        }
    `;

    const variables = {
        'context_id': contextId,
        'name': name,
        'classname': classname,
        'todo': incomplete,
        'definition': definition
    };

    // noinspection JSCheckFunctionSignatures
    const response = yield call(gqlFetch, userId, query, variables);

    // noinspection JSUnresolvedVariable
    const termId = response?.data?.insert_term_one?.term_id;
    console.assert(termId, response);
    return termId;
}

/**
 * @param contextId {string}
 * @param fromTermId {string}
 * @param fromMultiplierId {string|null}
 * @param toTermId {string}
 * @param toMultiplierId {string|null}
 * @return {string} Relation UUID
 */
function* addRelation(contextId, fromTermId, fromMultiplierId, toTermId, toMultiplierId) {
    const userId = yield select((state) => state.user.userId);
    const modelId = yield select((state) => state.model.id);

    // Update timestamp for interaction with model.
    yield put(viewUpsert(modelId));

    const query = gql`
        mutation (
            $context_id: uuid!,
            $from_term_id: uuid!, $from_multiplier_id: uuid!,
            $to_term_id: uuid!, $to_multiplier_id: uuid!) {
            insert_relation_one(object: {
                context_id: $context_id,
                from_term_id: $from_term_id,
                from_multiplier_id: $from_multiplier_id,
                to_term_id: $to_term_id,
                to_multiplier_id: $to_multiplier_id}) {
                relation_id
            }
        }
    `;

    const variables = {
        'context_id': contextId,
        'from_term_id': fromTermId,
        'from_multiplier_id': fromMultiplierId,
        'to_term_id': toTermId,
        'to_multiplier_id': toMultiplierId
    };

    // noinspection JSCheckFunctionSignatures
    const response = yield call(gqlFetch, userId, query, variables);

    // noinspection JSUnresolvedVariable
    const relationId = response?.data?.insert_relation_one?.relation_id;
    console.assert(relationId, response);
    return relationId;
}

/**
 * @param termId {string}
 * @param groupId {string}
 */
function* addTermToGroup(termId, groupId) {
    const userId = yield select((state) => state.user.userId);

    const query = gql`
        mutation ($group_id: uuid!, $term_id: uuid!) {
            insert_group_term_one(object: {group_id: $group_id, term_id: $term_id}) {
                term_id
            }
        }
    `;

    const variables = {
        'term_id': termId,
        'group_id': groupId
    };

    // noinspection JSCheckFunctionSignatures
    const response = yield call(gqlFetch, userId, query, variables);

    // noinspection JSUnresolvedVariable
    console.assert(response?.data?.insert_group_term_one, response);
}

/**
 * @param terms {Object[]}
 * @param name {string}
 * @return {Object|undefined}
 */
function getTerm(terms, name) {
    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        if (isSameTerm(term.name, name)) {
            return term;
        }
    }

    return undefined;
}

/**
 * @param termId {string}
 * @param incomplete {boolean}
 * @param definition {string}
 */
function* updateTermDefinition(termId, incomplete, definition) {
    const userId = yield select((state) => state.user.userId);
    const modelId = yield select((state) => state.model.id);

    // Update timestamp for interaction with model.
    yield put(viewUpsert(modelId));

    const query = gql`
        mutation (
            $term_id: uuid!,
            $todo: Boolean,
            $definition: String!) {
            update_term_by_pk(pk_columns: {term_id: $term_id},
                _set: {
                    todo: $todo,
                    definition: $definition}) {
                term_id
            }
        }
    `;

    const variables = {
        'term_id': termId,
        'todo': incomplete,
        'definition': definition
    };

    // noinspection JSCheckFunctionSignatures
    const response = yield call(gqlFetch, userId, query, variables);

    // noinspection JSUnresolvedVariable
    console.assert(response?.data?.update_term_by_pk?.term_id, response);
}
