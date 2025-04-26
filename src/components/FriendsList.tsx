import { useEffect, useState } from "react";
import { useChatContract, User } from "@/contexts/ChatContractContext";
import { Button } from "./ui/button";
import { Loader2, Users } from "lucide-react";

interface FriendsListProps {
  onSelectFriend: (friend: User) => void;
  selectedFriend: User | null;
}

export const FriendsList = ({
  onSelectFriend,
  selectedFriend,
}: FriendsListProps) => {
  const { getFriends } = useChatContract();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();

    // Set up interval to refresh friends list
    const interval = setInterval(loadFriends, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 h-full flex justify-center items-center">
        <Loader2 className="animate-spin h-6 w-6 text-crypto-indigo mr-2" />
        <span className="dark:text-gray-300">Loading friends...</span>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-64">
        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          No friends yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Go to "All Users" tab to add friends
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
      <div className="p-2">
        <Button
          onClick={loadFriends}
          variant="outline"
          size="sm"
          className="w-full text-xs mb-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Refresh Friends
        </Button>
      </div>
      <ul className="space-y-1 p-2">
        {friends.map((friend) => (
          <li key={friend.userAddress}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                selectedFriend?.userAddress === friend.userAddress
                  ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  : "dark:hover:bg-gray-800"
              }`}
              onClick={() => onSelectFriend(friend)}
            >
              <div className="flex items-center w-full overflow-hidden">
                <div className="h-8 w-8 rounded-full bg-crypto-indigo text-white flex items-center justify-center mr-2">
                  {friend.name.substring(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-medium truncate dark:text-white">
                    {friend.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {friend.userAddress.substring(0, 6)}...
                    {friend.userAddress.substring(38)}
                  </div>
                </div>
              </div>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
