export const actionTypes = {
    reset: 'import/reset',

    subscribeToContextTerms: 'import/subscribeToContextTerms',
    subscribeToContextTermsCallback: 'import/subscribeToContextTermsCallback',
    unsubscribeFromContextTerms: 'import/unsubscribeFromContextTerms',
    receiveContextTermsQueryResult: 'import/receiveContextTermsQueryResult',
};

export const reset = () => ({
    type: actionTypes.reset
});

export const subscribeToContextTerms = (id) => ({
    type: actionTypes.subscribeToContextTerms,
    id
});

export const subscribeToContextTermsCallback = (error, data, id) => ({
    type: actionTypes.subscribeToContextTermsCallback,
    error, data, id
});

export const unsubscribeFromContextTerms = () => ({
    type: actionTypes.unsubscribeFromContextTerms
});

export const receiveContextTermsQueryResult = (result) => ({
    type: actionTypes.receiveContextTermsQueryResult,
    result
});
