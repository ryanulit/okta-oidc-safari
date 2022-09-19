const localStorageKey = 'oidc-issues-user-state';

export const updateUserState = (state) => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
};

export const getUserState = () => {
    const json = localStorage.getItem(localStorageKey);
    
    if (!json) return;

    return JSON.parse(json);
};

export const clearUserState = () => {
    localStorage.removeItem(localStorageKey);
};