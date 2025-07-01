import { logout } from "./authslice.js";
const BASE_URL = import.meta.env.VITE_API_URL;

export const checkBackendAuth = () => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_URL}/checkToken/check`, {
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
