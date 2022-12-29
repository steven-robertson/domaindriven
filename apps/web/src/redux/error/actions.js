export const actionTypes = {
    reset: 'error/reset',
    error: 'error/error',
};

export const reset = () => ({
    type: actionTypes.reset
});

export const actions = (msg) => ({
    type: actionTypes.error,
    msg
});