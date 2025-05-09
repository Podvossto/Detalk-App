
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-crypto-indigo mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <Button 
          onClick={() => navigate("/")} 
          className="bg-gradient-crypto hover:opacity-90"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
