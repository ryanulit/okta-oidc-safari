# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Run the app locally

```
npm start

// runs in sudo privilege, so enter password when prompted by the cli
```

Will run the app in development mode on https://local.virtru.com.

Additional Requirements:
- port 443 to be available and a custom host entry for `127.0.0.1   local.virtru.com`
- `.env` file for environment variable values (ask me for this file)

_Note: The host entry above is necessary to match the redirect URI set in Okta app configuration_

## Reproduce the issue

Screen recording: https://screencast-o-matic.com/watch/c3QYowVOBhI

1) Run the app
2) Open Safari and navigate to the app running on https://local.virtru.com
3) Choose 'popup' from the login method dropdown
4) Click 'Login with Microsoft' to open a new tab and start the login process
5) Redirect flow between Okta and Microsoft Identity Provider will eventually fail
6) Okta error screen is shown with 400 Bad Request "Social Transaction Expired" error