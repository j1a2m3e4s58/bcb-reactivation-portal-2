import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export interface StaffAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  identity: ReturnType<typeof useInternetIdentity>["identity"];
}

export function useStaffAuth(): StaffAuthState {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const isAuthenticated = loginStatus === "success";
  const isLoading = loginStatus === "logging-in";

  async function handleLogin() {
    await login();
  }

  function handleLogout() {
    clear();
  }

  return {
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    identity,
  };
}
