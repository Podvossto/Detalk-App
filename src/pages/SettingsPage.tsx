import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatContract } from "@/contexts/ChatContractContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ChatLayout } from "@/components/ChatLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Loader2, ArrowLeft, Moon, Sun } from "lucide-react";

const SettingsPage = () => {
  const { loading, isRegistered, currentUser, currentAccount } =
    useChatContract();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isRegistered) {
      navigate("/");
    }
  }, [isRegistered, loading, navigate]);

  if (loading) {
    return (
      <ChatLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crypto-indigo" />
        </div>
      </ChatLayout>
    );
  }

  return (
    <ChatLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/chat")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Chat
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold my-5">Settings</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">
                Account Information
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={currentUser?.name || ""}
                    disabled
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Username cannot be changed after registration
                  </p>
                </div>

                <div>
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input
                    id="wallet"
                    value={currentAccount || ""}
                    disabled
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">
                Application Settings
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use dark theme for the application
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={theme === "dark"}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? "dark" : "light")
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
};

export default SettingsPage;
