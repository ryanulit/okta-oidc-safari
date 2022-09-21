import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { clearAuthState, createAuthState, getAuthState } from './helpers/auth-state';
import { clearUserState, getUserState, updateUserState } from './helpers/user-state';

const authServerBaseUrl = 'https://login.develop.virtru.com/oauth2/default/v1';

const clientId = process.env.REACT_APP_OIDC_CLIENT_ID;

const idps = {
  google: process.env.REACT_APP_OIDC_IDP_GOOGLE,
  microsoft: process.env.REACT_APP_OIDC_IDP_MICROSOFT
};

const redirectUris = {
  withRedirect: window.location.origin,
  withPopup: `${window.location.origin}/dist/OidcAuthModal.html`
};

function App() {
  const loginPopup = useRef();
  const [loginMethod, setLoginMethod] = useState('redirect');
  const [user, setUser] = useState();

  const loginWithRedirect = async (idp) => {
    const authState = await createAuthState();

    const url = new URL(`${authServerBaseUrl}/authorize`);
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUris.withRedirect);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('idp', idp);
    url.searchParams.append('scope', 'openid profile email offline_access');
    url.searchParams.append('code_challenge_method', 'S256');
    url.searchParams.append('code_challenge', authState.codeChallenge);
    url.searchParams.append('state', authState.stateKey);

    console.log(url.toString());
    //window.location.href = url.toString();
  };

  const loginWithPopup = async (idp) => {
    const authState = await createAuthState();

    const loginUrl = new URL(`${authServerBaseUrl}/authorize`);
    loginUrl.searchParams.append('client_id', clientId);
    loginUrl.searchParams.append('redirect_uri', redirectUris.withPopup);
    loginUrl.searchParams.append('response_type', 'code');
    loginUrl.searchParams.append('idp', idp);
    loginUrl.searchParams.append('scope', 'openid profile email offline_access');
    loginUrl.searchParams.append('code_challenge_method', 'S256');
    loginUrl.searchParams.append('code_challenge', authState.codeChallenge);
    loginUrl.searchParams.append('state', authState.stateKey);

    const popupUrl = redirectUris.withPopup;
    const popupUrlParams = `loginUrl=${encodeURIComponent(loginUrl)}`;
    loginPopup.current = window.open(`${popupUrl}?${popupUrlParams}`);
  };

  const handleLoginRedirect = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      const authState = getAuthState();

      if (state !== authState.stateKey) {
        throw new Error('State key mismatch');
      }

      const tokenUrl = `${authServerBaseUrl}/token`;
      const tokenUrlParams = new URLSearchParams();
      tokenUrlParams.append('client_id', clientId);
      tokenUrlParams.append('redirect_uri', redirectUris.withRedirect);
      tokenUrlParams.append('grant_type', 'authorization_code');
      tokenUrlParams.append('code', code);
      tokenUrlParams.append('code_verifier', authState.codeVerifier);

      const { data } = await axios.post(tokenUrl, tokenUrlParams);
      updateUserState(data);

      clearAuthState();
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleLoginWithPopupMessage = async (msg) => {
    const { code, state } = msg.data;
    
    if (code && state) {
      const authState = getAuthState();

      if (state !== authState.stateKey) {
        throw new Error('State key mismatch');
      }

      const tokenUrl = `${authServerBaseUrl}/token`;
      const tokenUrlParams = new URLSearchParams();
      tokenUrlParams.append('client_id', clientId);
      tokenUrlParams.append('redirect_uri', redirectUris.withPopup);
      tokenUrlParams.append('grant_type', 'authorization_code');
      tokenUrlParams.append('code', code);
      tokenUrlParams.append('code_verifier', authState.codeVerifier);

      const { data } = await axios.post(tokenUrl, tokenUrlParams);
      updateUserState(data);
      setUser(data);

      clearAuthState();

      if (loginPopup.current) {
        loginPopup.current.close();
      }
    };
  };

  const login = async (idp) => {
    if (loginMethod === 'redirect') {
      await loginWithRedirect(idp);
    } else {
      await loginWithPopup(idp);
    }
  };

  const logout = async () => {
    let logoutUrl = window.location.origin;

    if (user) {
      const revokeUrl = `${authServerBaseUrl}/revoke`;
      const revokeUrlParams = new URLSearchParams();
      revokeUrlParams.append('client_id', clientId);
      revokeUrlParams.append('token', user.refresh_token);
      revokeUrlParams.append('token_type_hint', 'refresh_token');
      await axios.post(revokeUrl, revokeUrlParams);

      const logoutUrlBuilder = new URL(`${authServerBaseUrl}/logout`);
      logoutUrlBuilder.searchParams.append('id_token_hint', user.id_token);
      logoutUrlBuilder.searchParams.append('post_logout_redirect_uri', window.location.origin);

      logoutUrl = logoutUrlBuilder.toString();
    }

    clearUserState();

    window.location.href = logoutUrl;
  }

  const checkAuthenticated = async () => {
    await handleLoginRedirect();
    
    const userState = getUserState();

    if (userState) {
      setUser(userState);
    }
  };

  useEffect(() => {
    checkAuthenticated();
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleLoginWithPopupMessage);

    return () => {
      window.removeEventListener('message', handleLoginWithPopupMessage);
    };
  }, []);

  return (
    <>
      <h1>OIDC Issues Sample</h1>
      {user && (
        <div>
          <h2>Authenticated</h2>
          <p>
            <button type="button" onClick={logout}>Logout</button>
          </p>
        </div>
      )}
      {!user && (
        <div>
          <h2>Login</h2>
          <p>
            Login Method:
            <select value={loginMethod} onChange={e => setLoginMethod(e.target.value)} style={{ 'marginLeft': '5px' }}>
              <option value="redirect">Redirect</option>
              <option value="popup">Popup</option>
            </select>
          </p>
          <p>
            <button type="button" onClick={() => login(idps.microsoft)}>Login With Microsoft</button>
          </p>
          <p>
            <button type="button" onClick={() => login(idps.google)}>Login With Google</button>
          </p>
        </div>
      )}
    </>
  );
}

export default App;
