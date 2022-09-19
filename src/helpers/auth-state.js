import { v4 as uuid } from 'uuid';
import { generateCodeChallenge, generateCodeVerifier } from './pkce';

const localStorageKey = 'oidc-issues-auth-state';

export const createAuthState = async () => {
    const stateKey = `state-${uuid()}`;
    const codeVerifier = generateCodeVerifier(90);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const state = {
        stateKey,
        codeVerifier,
        codeChallenge
    };

    localStorage.setItem(localStorageKey, JSON.stringify(state));

    return state;
};

export const getAuthState = () => {
    const json = localStorage.getItem(localStorageKey);

    if (!json) return;
    
    return JSON.parse(json);
};

export const clearAuthState = () => localStorage.removeItem(localStorageKey);