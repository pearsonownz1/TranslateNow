import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const CallbackPage = () => {
  const { handleRedirectCallback, isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL parameters
        const error = searchParams.get("error");
        if (error) {
          console.error("Auth0 error:", error, searchParams.get("error_description"));
          navigate("/login", { replace: true });
          return;
        }

        // Get the state from URL parameters
        const state = searchParams.get("state");
        if (!state) {
          console.error("No state parameter found in URL");
          navigate("/login", { replace: true });
          return;
        }

        // Handle the callback
        const result = await handleRedirectCallback();
        console.log("Auth0 callback result:", result);
        
        // Check if we have a return URL in appState
        const appState = result?.appState || {};
        const returnTo = appState.returnTo || "/dashboard";
        
        // Add a small delay to ensure Auth0 state is updated
        setTimeout(() => {
          navigate(returnTo, { replace: true });
        }, 100);
      } catch (error) {
        console.error("Error handling callback:", error);
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default CallbackPage; 