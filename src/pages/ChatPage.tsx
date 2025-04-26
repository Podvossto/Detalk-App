import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatContract, User } from "@/contexts/ChatContractContext";
import { ChatLayout } from "@/components/ChatLayout";
import { FriendsList } from "@/components/FriendsList";
import { UserList } from "@/components/UserList";
import { ChatWindow } from "@/components/ChatWindow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ChatPage = () => {
  const { isRegistered, loading, currentUser } = useChatContract();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    if (!loading && !isRegistered) {
      navigate("/");
    }
  }, [isRegistered, loading, navigate]);

  // Check if a friend was selected from another page
  useEffect(() => {
    const storedFriend = sessionStorage.getItem("selectedFriend");
    if (storedFriend) {
      try {
        const friend = JSON.parse(storedFriend);
        setSelectedFriend(friend);
        setActiveTab("friends");
        // Clear from session storage
        sessionStorage.removeItem("selectedFriend");
      } catch (error) {
        console.error("Error parsing stored friend:", error);
      }
    }
  }, []);

  const handleSelectFriend = (friend: User) => {
    setSelectedFriend(friend);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-crypto-indigo mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading blockchain data...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Not connected to blockchain
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-crypto-indigo text-white rounded-md hover:bg-crypto-purple"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 min-h-[600px] gap-0 md:gap-4 rounded-lg my-4 mx-2 md:mx-4 bg-white dark:bg-gray-800 shadow-sm">
        <div className="md:col-span-1 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <Tabs
            defaultValue="friends"
            className="w-full h-full flex flex-col"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="friends" className="flex-1">
                  Friends
                </TabsTrigger>
                <TabsTrigger value="all-users" className="flex-1">
                  All Users
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="friends"
              className="mt-0 flex-1 overflow-auto max-h-[75vh]"
            >
              <FriendsList
                onSelectFriend={handleSelectFriend}
                selectedFriend={selectedFriend}
              />
            </TabsContent>

            <TabsContent
              value="all-users"
              className="mt-0 flex-1 overflow-auto max-h-[75vh]"
            >
              <UserList
                onSelectFriend={(user) => {
                  handleSelectFriend(user);
                  setActiveTab("friends");
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-2 flex flex-col">
          {selectedFriend ? (
            <ChatWindow friend={selectedFriend} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 min-h-[600px]">
              <div className="text-center p-6">
                <img
                  src={
                    theme === "dark"
                      ? "/pictures/DeTalk-LightLogo.png"
                      : "/pictures/DeTalk-DarkLogo.png"
                  }
                  alt="DeTalk Logo"
                  className="w-50 h-24 mx-auto mb-4 opacity-60"
                />
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Let's get started
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {activeTab === "friends"
                    ? "Select a friend to start messaging"
                    : "Browse users to add them as friends"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChatLayout>
  );
};

export default ChatPage;
