export const actionTypes = {
    requestTermsOfUse: 'app/requestTermsOfUse',
    receiveTermsOfUse: 'app/receiveTermsOfUse',
    requestPrivacyPolicy: 'app/requestPrivacyPolicy',
    receivePrivacyPolicy: 'app/receivePrivacyPolicy',
};

export const requestTermsOfUse = () => ({
    type: actionTypes.requestTermsOfUse
})

export const receiveTermsOfUse = (text) => ({
    type: actionTypes.receiveTermsOfUse,
    text
})

export const requestPrivacyPolicy = () => ({
    type: actionTypes.requestPrivacyPolicy
})

export const receivePrivacyPolicy = (text) => ({
    type: actionTypes.receivePrivacyPolicy,
    text
})
