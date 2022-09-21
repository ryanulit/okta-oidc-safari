# Okta OIDC issues with Safari sample app

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Run the app locally

### 1) Install dependencies

```
npm install
```

### 2) Setup local environment

- Add .env file obtained outside of Github to root directory of cloned repo
- Add entry to hosts file for `127.0.0.1   local.virtru.com`. This is necessary to match the redirect URIs specified in Okta authorization server.
- Ensure port 443 is not in use

### 3) Run app

```
npm start

// runs with sudo privilege, so enter password when prompted by the cli
```

App is now running in development mode on https://local.virtru.com.

## Reproduce the issue

Screen recording: https://screencast-o-matic.com/watch/c3QYowVOBhI

1) Run the app
2) Open Safari and navigate to the app running on https://local.virtru.com
3) Choose 'popup' from the login method dropdown
4) Click 'Login with Microsoft' to open a new tab and start the login process
5) Redirect flow between Okta and Microsoft Identity Provider will eventually fail
6) Okta error screen is shown with 400 Bad Request "Social Transaction Expired" error