import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const CallbackPage = () => {
  const { handleRedirectCallback } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    handleRedirectCallback()
      .then(() => {
        // Redirect to dashboard after successful login
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error handling callback:", error);
        // Redirect to login page if there's an error
        navigate("/login");
      });
  }, [handleRedirectCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default CallbackPage; 