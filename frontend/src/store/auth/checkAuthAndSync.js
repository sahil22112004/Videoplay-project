import { logout } from "./authslice.js";

export const checkBackendAuth = () => async (dispatch) => {
  try {
    const res = await fetch("/api/checkToken/check", {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();

    if (!data?.data?.isAuthenticated) {
      dispatch(logout()); 
    }
  } catch (error) {
    console.error("Auth sync failed:", error);
    dispatch(logout());
  }
};
