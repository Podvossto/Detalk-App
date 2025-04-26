import { useEffect, useState } from "react";
import { useChatContract, User } from "@/contexts/ChatContractContext";
import { Button } from "./ui/button";
import { toast } from "@/components/ui/sonner";
import { Loader2, UserPlus, Check, MessageSquare } from "lucide-react";

interface UserListProps {
  onSelectFriend: (user: User) => void;
}

interface ExtendedUser extends User {
  isFriend?: boolean;
}

export const UserList = ({ onSelectFriend }: UserListProps) => {
  const { getAllUsers, addFriend, getFriends, currentAccount } =
    useChatContract();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingFriend, setAddingFriend] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get all users
      const usersList = await getAllUsers();

      // Get friends list
      const friendsList = await getFriends();
      const friendAddresses = friendsList.map((f) =>
        f.userAddress.toLowerCase()
      );

      // Filter out current user and mark friends
      const filteredUsers = usersList
        .filter(
          (user) =>
            user.userAddress.toLowerCase() !== currentAccount?.toLowerCase()
        )
        .map((user) => ({
          ...user,
          isFriend: friendAddresses.includes(user.userAddress.toLowerCase()),
        }));

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddFriend = async (user: User) => {
    setAddingFriend(user.userAddress);
    try {
      const success = await addFriend(user.userAddress);
      if (success) {
        toast.success(`Added ${user.name} as a friend!`);

        // Mark the user as added in the UI
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userAddress === user.userAddress ? { ...u, isFriend: true } : u
          )
        );

        // Notify parent component about the new friend
        onSelectFriend(user);
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Failed to add friend");
    } finally {
      setAddingFriend(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 h-full flex justify-center items-center">
        <Loader2 className="animate-spin h-6 w-6 text-crypto-indigo mr-2" />
        <span className="dark:text-gray-300">Loading users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No other users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
      <div className="p-2">
        <Button
          onClick={loadUsers}
          variant="outline"
          size="sm"
          className="w-full text-xs mb-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Refresh Users
        </Button>
      </div>
      <ul className="space-y-1 p-2">
        {users.map((user) => (
          <li
            key={user.userAddress}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex items-center overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-crypto-purple text-white flex items-center justify-center mr-2">
                {user.name.substring(0, 1).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="font-medium truncate dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.userAddress.substring(0, 6)}...
                  {user.userAddress.substring(38)}
                </div>
              </div>
            </div>

            {user.isFriend ? (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 dark:text-green-500 dark:border-green-500"
                onClick={() => onSelectFriend(user)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-crypto-indigo hover:bg-crypto-purple"
                onClick={() => handleAddFriend(user)}
                disabled={addingFriend === user.userAddress}
              >
                {addingFriend === user.userAddress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
