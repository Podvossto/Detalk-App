// Add type declaration at the top of the file
declare global {
  interface Window {
    ethereum: {
      isMetaMask?: boolean;
      request: (request: {
        method: string;
        params?: Array<unknown>;
      }) => Promise<unknown>;
      on: (eventName: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (
        eventName: string,
        callback: (...args: unknown[]) => void
      ) => void;
      selectedAddress?: string;
    };
  }
}

import { Link, useNavigate } from "react-router-dom";
import { useChatContract } from "@/contexts/ChatContractContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ethers } from "ethers";
import { LogOut, Settings, User, MessageSquare, Menu } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { RequestTokenDialog } from "./RequestTokenDialog";
import { PendingMessages } from "./PendingMessages";

export const Header = () => {
  const { currentUser, currentAccount, tokenContract, disconnectWallet } =
    useChatContract();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();

    // Disconnect wallet
    try {
      await disconnectWallet();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout");
    }

    // Navigate to login page
    navigate("/");
  };

  const getShortAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/chat" className="flex items-center">
            {/* <MessageSquare className="h-6 w-6 text-crypto-indigo mr-2" /> */}
            <img
              src="pictures/DeTalk-DarkLogo.png"
              alt="DeTalk"
              className="w-24"
            />
            {/* <span className="font-bold text-lg hidden sm:inline dark:text-white">
              DeTalk
            </span> */}
          </Link>
        </div>

        {currentUser && (
          <div className="flex items-center gap-4">
            {tokenContract && currentAccount && (
              <div className="hidden sm:block">
                <RequestTokenDialog />
              </div>
            )}

            <div className="hidden sm:block">
              <PendingMessages />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentAccount && getShortAddress(currentAccount)}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {tokenContract && currentAccount && (
                  <DropdownMenuItem asChild>
                    <div className="sm:hidden">
                      <RequestTokenDialog />
                    </div>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <div className="sm:hidden">
                    <PendingMessages />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};
