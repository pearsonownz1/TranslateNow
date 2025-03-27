import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const CallbackPage = () => {
  const { handleRedirectCallback, isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        console.log("Auth0 callback handled successfully");
        console.log("User authenticated:", isAuthenticated);
        console.log("User data:", user);
        
        // Always redirect to dashboard after successful authentication
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Error handling callback:", error);
        // Only redirect to login if there's an actual error
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate, isAuthenticated, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default CallbackPage; 