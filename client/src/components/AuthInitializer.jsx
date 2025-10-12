import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "../store/slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;
