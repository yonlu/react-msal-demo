import './App.css'
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from './auth-config';
import { useCallback, useEffect, useState } from 'react';
import useCountdownTimer from './hooks/useCountdownTimer';
import { AuthenticationResult } from '@azure/msal-browser';

const ProfileContent = ({ tokenExpirationTime, setTokenExpirationTime }) => {
  const { instance, accounts } = useMsal();

  const timeLeft = useCountdownTimer(tokenExpirationTime);

  const requestProfileData = useCallback(() => {
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response: AuthenticationResult) => {
        console.log("Profile data acquired", response)
        const expiresOn = new Date(response?.expiresOn)
        setTokenExpirationTime(expiresOn);
      });
  }, [accounts, instance, setTokenExpirationTime])

  useEffect(() => {
    if (!accounts) return;

    requestProfileData();
  }, [accounts, requestProfileData]);


  if (!accounts) return <div>No accounts</div>;

  return (
    <>
      <h5 className="card-title">Welcome {accounts[0].name}</h5>
      <div>Token expires in: {timeLeft}</div>
      <button onClick={requestProfileData}>Request profile data</button>
    </>
  );
};

export const LoginButton = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    await instance.handleRedirectPromise();

    const accounts = instance.getAllAccounts();

    if (accounts.length) return

    return instance
      .loginRedirect(loginRequest)
      .catch(e => console.log(e));
  }

  return (
    <button onClick={handleLogin}>Login</button>
  )
}

const LogoutButton = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  }

  return (
    <button onClick={handleLogout}>Logout</button>
  )
}

const ForceRefreshButton = ({ instance, accounts, setTokenExpirationTime }) => {
  const handleRefresh = () => {
    instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
      forceRefresh: true
    }).then(response => {
      console.log("Token refreshed:", response);
      const newExpiresOn = new Date(response.expiresOn);
      setTokenExpirationTime(newExpiresOn);
    }).catch(error => {
      console.error("Error refreshing token:", error);
    });
  };

  return (
    <button onClick={handleRefresh}>Force Token Refresh</button>
  );
};

function App() {
  const { instance, accounts } = useMsal();
  const [tokenExpirationTime, setTokenExpirationTime] = useState<Date | null>(null);

  return (
    <>
      <AuthenticatedTemplate>
        <ProfileContent tokenExpirationTime={tokenExpirationTime} setTokenExpirationTime={setTokenExpirationTime} />
        <LogoutButton />
        <ForceRefreshButton instance={instance} accounts={accounts} setTokenExpirationTime={setTokenExpirationTime} />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <h5>Please sign-in to see your profile information.</h5>
        <LoginButton />
      </UnauthenticatedTemplate>
    </>
  )
}

export default App
