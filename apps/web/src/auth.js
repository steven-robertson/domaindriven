import axios from "axios";
import Constants from "./constants";

/**
 * @type {string|undefined}
 */
let authToken = undefined;

/**
 * @return {string|undefined}
 */
export function getAuthToken() {
    return authToken;
}

export function login() {
    window.location.href = `${Constants.authBase}/login?redirect_url=${window.location.href}`;
}

export function logout() {
    authToken = undefined;
    window.location.href = `${Constants.authBase}/logout?redirect_url=${window.location.href}`;
}

/**
 * @param jwt {string}
 * @return {boolean}
 */
export function isExpired(jwt) {
    if (!jwt) return true;
    const b = jwt.split('.');
    const a = b[1];
    const o = JSON.parse(atob(a));
    const s = new Date().getTime() / 1000;
    const exp = o['exp'];
    return exp < s + 30; // NOTE: 30 seconds or more remaining.
}

/**
 * @return {Promise<string|void>}
 */
export function refreshToken() {
    return axios.get(`${Constants.authBase}/token`, {
        withCredentials: true
    }).then(response => {
        const jwt = response.data.token;
        console.assert(jwt, 'invalid jwt value');
        authToken = jwt;
        return jwt;
    }).catch(_ => login());
}
