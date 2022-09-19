const sha256 = async (plain) => {
    const data = new TextEncoder().encode(plain);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return hash;
};

export const generateCodeVerifier = (len) => {
    // unreserved character set per https://datatracker.ietf.org/doc/html/rfc7636#section-4.1
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const charsetLen = charset.length;

    const randomValuesArr = new Uint8Array(len);
    window.crypto.getRandomValues(randomValuesArr);
    const chars = new Array(len);
    for (let i = 0; i < len; i++) {
        chars[i] = charset.charCodeAt(randomValuesArr[i] % charsetLen);
    }
    return String.fromCharCode(...chars);
};

export const generateCodeChallenge = async (codeVerifier) => {
    const sha256Hash = await sha256(codeVerifier);
    const uIntArray = new Uint8Array(sha256Hash);
    const str = String.fromCharCode(...uIntArray);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
