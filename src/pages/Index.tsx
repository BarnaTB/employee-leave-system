
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useMsal } from "../hooks/useMsal";

const Index = () => {
  const { login, isAuthenticated } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleMicrosoftLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to authenticate with Microsoft. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Leave Management System</CardTitle>
          <CardDescription className="text-center">
            Sign in with your Microsoft account to access the leave management portal
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            onClick={handleMicrosoftLogin}
            className="w-full bg-[#2f2f2f] hover:bg-[#1f1f1f] text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M11 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              <path d="M11 7H4" />
              <path d="M11 13H4" />
              <path d="m18 16 3-8" />
              <path d="m21 16-3-8" />
              <path d="M22 16H16" />
            </svg>
            Sign in with Microsoft
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Company Leave Management Portal
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
