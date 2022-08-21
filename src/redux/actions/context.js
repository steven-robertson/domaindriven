export const actionTypes = {
    reset: 'context/reset',

    subscribeToContext: 'context/subscribeToContext',
    subscribeToContextCallback: 'context/subscribeToContextCallback',
    unsubscribeFromContext: 'context/unsubscribeFromContext',
    receiveContextQueryResult: 'context/receiveContextQueryResult',

    addContext: 'context/addContext',
    removeContext: 'context/removeContext',
    renameContext: 'context/renameContext',

    addTerm: 'context/addTerm',
    editTerm: 'context/editTerm',
    removeTerm: 'context/removeTerm',

    addDemotedTerm: 'context/addDemotedTerm',
    editDemotedTerm: 'context/editDemotedTerm',
    removeDemotedTerm: 'context/removeDemotedTerm',

    addGroup: 'context/addGroup',
    editGroup: 'context/editGroup',
    removeGroup: 'context/removeGroup',

    addRelation: 'context/addRelation',
    editRelation: 'context/editRelation',
    removeRelation: 'context/removeRelation',

    setTermsEnabled: 'context/setTermsEnabled',
    setGroupedTermsEnabled: 'context/setGroupedTermsEnabled',
    importTerms: 'context/importTerms',
    editNotes: 'context/editNotes',
};

/**
 * Resets the entire model state.
 */
export const reset = () => ({
    type: actionTypes.reset
});

/**
 * Subscribes to the data for a single model.
 * @param id {string} Context UUID string.
 */
export const subscribeToContext = (id) => ({
    type: actionTypes.subscribeToContext,
    id
});

/**
 * Callback with the data from the GraphQL query for loading a model.
 * @param error {Object} If an error occurred.
 * @param data {Object} Context data from GraphQL query.
 * @param id {string} Context UUID string.
 */
export const subscribeToContextCallback = (error, data, id) => ({
    type: actionTypes.subscribeToContextCallback,
    error, data, id
});

/**
 * Unsubscribes to the data for a single model.
 */
export const unsubscribeFromContext = () => ({
    type: actionTypes.unsubscribeFromContext
});

/**
 * Action used to load the model data in the Redux store.
 * @param result {Object} Data to be stored in Redux store using reducer.
 */
export const receiveContextQueryResult = (result) => ({
    type: actionTypes.receiveContextQueryResult,
    result
});

/**
 * Adds a new context.
 * @param name {string} Name of the context to be added.
 * @param modelId {string} UUID for the model that will own the context.
 * @param navigate {Object} Hook that will be used to navigate on completion of the GraphQL query.
 */
export const addContext = (name, modelId, navigate) => ({
    type: actionTypes.addContext,
    name, modelId, navigate
});

/**
 * Removes the context with the given UUID.
 * @param contextId {string} Context UUID string ID.
 * @param navigate {Object} Hook that will be used to navigate on completion of the GraphQL query.
 */
export const removeContext = (contextId, navigate) => ({
    type: actionTypes.removeContext,
    contextId, navigate
});

/**
 * Renames a context.
 * @param contextId {string} Context UUID string ID.
 * @param name {string} New name for the context.
 */
export const renameContext = (contextId, name) => ({
    type: actionTypes.renameContext,
    contextId, name
});

/**
 * Add a new term to the context.
 * @param contextId {string} Context UUID string ID.
 * @param name {string} Name of the term.
 * @param classname {string} Class name used in the domain model diagram.
 * @param incomplete {boolean} True if the item is still to be completed, false otherwise.
 * @param definition {string} The terms definition.
 */
export const addTerm = (contextId, name, classname, incomplete, definition) => ({
    type: actionTypes.addTerm,
    contextId, name, classname, incomplete, definition
});

/**
 * Edit the term info.
 * @param termId {string} UUID of the term record.
 * @param name {string} Name of the term.
 * @param classname {string} Class name used in the domain model diagram.
 * @param incomplete {boolean} True if the item is still to be completed, false otherwise.
 * @param definition {string} The terms definition.
 */
export const editTerm = (termId, name, classname, incomplete, definition) => ({
    type: actionTypes.editTerm,
    termId, name, classname, incomplete, definition
});

/**
 * Removes the term from the context.
 * @param termId {string} UUID of the term record.
 */
export const removeTerm = (termId) => ({
    type: actionTypes.removeTerm,
    termId
});

/**
 * Add a new term to the context.
 * @param contextId {string} Context UUID string ID.
 * @param name {string} Name of the demoted term.
 * @param termId {string} UUID of the preferred term.
 */
export const addDemotedTerm = (contextId, name, termId) => ({
    type: actionTypes.addDemotedTerm,
    contextId, name, termId
});

/**
 * Edit the term info.
 * @param demotedId {string} UUID of the demoted term record.
 * @param name {string} Name of the term.
 * @param termId {string} UUID of the preferred term.
 */
export const editDemotedTerm = (demotedId, name, termId) => ({
    type: actionTypes.editDemotedTerm,
    demotedId, name, termId
});

/**
 * Removes the term from the context.
 * @param demotedId {string} UUID of the demoted term record.
 */
export const removeDemotedTerm = (demotedId) => ({
    type: actionTypes.removeDemotedTerm,
    demotedId
});

/**
 * Add a term group to the context.
 * @param contextId {string} Context UUID string ID.
 * @param name {string} Name for the group.
 * @param description Description for the group.
 * @param enabledTerms The initial set of enabled terms selected for the group.
 */
export const addGroup = (contextId, name, description, enabledTerms) => ({
    type: actionTypes.addGroup,
    contextId, name, description, enabledTerms
});

/**
 * Edit the term group.
 * @param groupId {string} UUID for the group to be edited.
 * @param name {string} Name for the group.
 * @param description Description for the group.
 * @param enabledTerms The initial set of enabled terms selected for the group.
 */
export const editGroup = (groupId, name, description, enabledTerms) => ({
    type: actionTypes.editGroup,
    groupId, name, description, enabledTerms
});

/**
 * Remove term group from context.
 * @param groupId {string} UUID for the group to be removed.
 */
export const removeGroup = (groupId) => ({
    type: actionTypes.removeGroup,
    groupId
});

/**
 * Add a new relation between terms.
 * @param contextId {string} Context UUID string ID.
 * @param fromTermId {string} UUID for the term at the 'from' side of the relation.
 * @param fromMultiplierId {string} UUID for the multiplicity symbol to use on the 'from' side.
 * @param toTermId {string} UUID for the term at the 'to' side of the relation.
 * @param toMultiplierId {string} UUID for the multiplicity symbol to use on the 'to' side.
 */
export const addRelation = (contextId, fromTermId, fromMultiplierId, toTermId, toMultiplierId) => ({
    type: actionTypes.addRelation,
    contextId, fromTermId, fromMultiplierId, toTermId, toMultiplierId
});

/**
 * Edit a relation between terms.
 * @param relationId {string} UUID for the relation.
 * @param fromTermId {string} UUID for the term at the 'from' side of the relation.
 * @param fromMultiplierId {string} UUID for the multiplicity symbol to use on the 'from' side.
 * @param toTermId {string} UUID for the term at the 'to' side of the relation.
 * @param toMultiplierId {string} UUID for the multiplicity symbol to use on the right-side.
 */
export const editRelation = (relationId, fromTermId, fromMultiplierId, toTermId, toMultiplierId) => ({
    type: actionTypes.editRelation,
    relationId, fromTermId, fromMultiplierId, toTermId, toMultiplierId
});

/**
 * Remove a relation between terms.
 * @param relationId {string} UUID for the relation.
 */
export const removeRelation = (relationId) => ({
    type: actionTypes.removeRelation,
    relationId
});

/**
 * Enable/disable selected terms.
 * @param termIds {string[]} UUIDs for the terms to enable or disable.
 * @param enabled {boolean} True to enable terms, and false to disable terms.
 */
export const setTermsEnabled = (termIds, enabled) => ({
    type: actionTypes.setTermsEnabled,
    termIds, enabled
});

/**
 * Enable/disable selected term groups.
 * @param groupIds {string[]} UUIDs for the term groups to enable or disable.
 * @param enabled {boolean} True to enable groups, and false to disable groups.
 * @param except {string} Enable/disable all except the group with this UUID.
 */
export const setGroupedTermsEnabled = (groupIds, enabled, except) => ({
    type: actionTypes.setGroupedTermsEnabled,
    groupIds, enabled, except
});

/**
 * @param contextId {string}
 * @param terms {Object[]}
 * @param relations {Object[]}
 */
export const importTerms = (contextId, terms, relations) => ({
    type: actionTypes.importTerms,
    contextId, terms, relations
});

/**
 * @param contextId {string}
 * @param notes {string}
 */
export const editNotes = (contextId, notes) => ({
    type: actionTypes.editNotes,
    contextId, notes
});
