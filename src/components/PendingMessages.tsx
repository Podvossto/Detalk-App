import { useState, useEffect } from "react";
import { useChatContract, User, Message } from "@/contexts/ChatContractContext";
import { Button } from "./ui/button";
import { MessageSquare, UserPlus, Loader2 } from "lucide-react";
import { toast } from "./ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

export const PendingMessages = () => {
  const { chatContract, currentAccount, getAllUsers, getMessages, addFriend } =
    useChatContract();
  const [pendingMessages, setPendingMessages] = useState<{
    [key: string]: { user: User; count: number };
  }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState<{
    [key: string]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchPendingMessages = async () => {
    if (!chatContract || !currentAccount) return;

    setIsLoading(true);
    try {
      // 1. Get all users
      const allUsers = await getAllUsers();
      console.log("Found", allUsers.length, "total users");

      // 2. Get all friends
      const friends = await chatContract.getFriends();
      console.log("Found", friends.length, "friends");
      const friendAddresses = friends.map((friend: User) =>
        friend.userAddress.toLowerCase()
      );

      // 3. Filter users who are not friends and not self
      const nonFriends = allUsers.filter(
        (user) =>
          user.userAddress.toLowerCase() !== currentAccount.toLowerCase() &&
          !friendAddresses.includes(user.userAddress.toLowerCase())
      );
      console.log("Found", nonFriends.length, "non-friends");

      // 4. Check if there are messages from non-friends
      const pending: { [key: string]: { user: User; count: number } } = {};

      for (const user of nonFriends) {
        try {
          const messages = await getMessages(user.userAddress);
          // Count only messages sent by the other user
          const count = messages.filter(
            (msg) => msg.sender.toLowerCase() === user.userAddress.toLowerCase()
          ).length;

          if (count > 0) {
            console.log(`Found ${count} messages from ${user.name}`);
            pending[user.userAddress] = { user, count };
          }
        } catch (error) {
          console.error(
            `Error fetching messages from ${user.userAddress}:`,
            error
          );
        }
      }

      setLastChecked(new Date());
      setPendingMessages(pending);
    } catch (error) {
      console.error("Error fetching pending messages:", error);
      toast.error("Error checking for new messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (userAddress: string) => {
    setIsAddingFriend({ ...isAddingFriend, [userAddress]: true });

    try {
      const success = await addFriend(userAddress);
      if (success) {
        toast.success("Friend added successfully");
        // Update pending messages list
        fetchPendingMessages();
      } else {
        toast.error("Failed to add friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Error occurred while adding friend");
    } finally {
      setIsAddingFriend({ ...isAddingFriend, [userAddress]: false });
    }
  };

  const handleRefresh = () => {
    fetchPendingMessages();
  };

  // Check for new messages every 30 seconds
  useEffect(() => {
    fetchPendingMessages();
    const interval = setInterval(fetchPendingMessages, 30000);
    return () => clearInterval(interval);
  }, [currentAccount]);

  return (
    <>
      <Button
        variant={
          Object.keys(pendingMessages).length > 0 ? "default" : "outline"
        }
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4 mr-2" />
        )}
        New Messages
        {Object.keys(pendingMessages).length > 0 && (
          <Badge variant="destructive" className="ml-1">
            {Object.keys(pendingMessages).length}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pending Messages</DialogTitle>
            <DialogDescription>
              Messages from users who are not your friends yet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-auto p-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : Object.values(pendingMessages).length > 0 ? (
              Object.values(pendingMessages).map(({ user, count }) => (
                <Card key={user.userAddress}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">{user.name}</CardTitle>
                    <CardDescription className="text-xs truncate">
                      {user.userAddress}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{count} pending messages</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAddFriend(user.userAddress)}
                      disabled={isAddingFriend[user.userAddress]}
                      className="w-full"
                    >
                      {isAddingFriend[user.userAddress] ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                          Adding friend...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">
                No pending messages from non-friends
              </p>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {lastChecked && (
                <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...
                </>
              ) : (
                "Check Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
