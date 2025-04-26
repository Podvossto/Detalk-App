import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useChatContract,
  User,
  Transaction,
} from "@/contexts/ChatContractContext";
import { ChatLayout } from "@/components/ChatLayout";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Mail,
  UserPlus,
  UserCheck,
  ArrowLeft,
  ArrowDownUp,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { ethers } from "ethers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

const ProfilePage = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const {
    currentAccount,
    isRegistered,
    loading,
    getUserByAddress,
    currentUser,
    addFriend,
    getFriends,
    tokenContract,
    getTransactionHistory,
  } = useChatContract();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [isFriend, setIsFriend] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const isOwnProfile =
    !address ||
    (currentAccount &&
      address?.toLowerCase() === currentAccount?.toLowerCase());

  useEffect(() => {
    if (!loading && !isRegistered) {
      navigate("/");
    }
  }, [isRegistered, loading, navigate]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // If no address is provided or it matches current user, show current user profile
        if (isOwnProfile) {
          if (currentUser) {
            setProfileUser(currentUser);
          }
        } else if (address) {
          // Otherwise fetch the user by address
          const user = await getUserByAddress(address);
          if (user) {
            setProfileUser(user);
          } else {
            toast.error("User not found");
            navigate("/chat");
          }
        }

        // Fetch token balance for current user
        if (tokenContract && currentAccount) {
          const balance = await tokenContract.balanceOf(currentAccount);
          setTokenBalance(ethers.utils.formatEther(balance));
        }

        // Fetch friends
        const friendsList = await getFriends();
        setFriends(friendsList);

        // Check if viewed profile is a friend
        if (
          address &&
          friendsList.some(
            (friend) =>
              friend.userAddress.toLowerCase() === address.toLowerCase()
          )
        ) {
          setIsFriend(true);
        }

        // If this is the user's own profile, fetch transaction history
        if (isOwnProfile) {
          const txHistory = await getTransactionHistory();
          setTransactions(txHistory);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchProfileData();
    }
  }, [
    address,
    currentAccount,
    currentUser,
    getUserByAddress,
    isOwnProfile,
    loading,
    navigate,
    tokenContract,
    getFriends,
    getTransactionHistory,
  ]);

  const handleAddFriend = async () => {
    if (!profileUser) return;

    setIsAddingFriend(true);
    try {
      const success = await addFriend(profileUser.userAddress);
      if (success) {
        toast.success(`Added ${profileUser.name} as a friend`);
        setIsFriend(true);
      } else {
        toast.error("Failed to add friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Error adding friend");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const startChat = () => {
    if (profileUser) {
      navigate("/chat");
      // We need to pass this information to the chat page somehow
      // For now, we'll store it in session storage
      sessionStorage.setItem("selectedFriend", JSON.stringify(profileUser));
    }
  };

  // Helper function to format transaction type for display
  const formatTransactionType = (type: string): string => {
    switch (type) {
      case "TokenSent":
        return "Sent Tokens";
      case "TokenReceived":
        return "Received Tokens";
      case "MessageSent":
        return "Sent Message";
      case "TokenRequested":
        return "Requested Tokens";
      case "FriendAdded":
        return "Added Friend";
      default:
        return type;
    }
  };

  // Helper function to truncate address
  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // TransactionHistory component
  const TransactionHistory = ({
    transactions,
  }: {
    transactions: Transaction[];
  }) => {
    const [showAll, setShowAll] = useState(false);
    const { getUserByAddress } = useChatContract();
    const [userAddressMap, setUserAddressMap] = useState<
      Record<string, string>
    >({});
    const [isLoadingNames, setIsLoadingNames] = useState(false);

    const displayedTransactions = showAll
      ? transactions
      : transactions.slice(0, 5);

    // Load user names for all addresses in transactions
    useEffect(() => {
      const loadUserNames = async () => {
        if (transactions.length === 0) return;

        setIsLoadingNames(true);
        const addressMap: Record<string, string> = {};

        // Collect all unique addresses
        const addresses = new Set<string>();
        transactions.forEach((tx) => {
          if (tx.from) addresses.add(tx.from);
          if (tx.to) addresses.add(tx.to);
        });

        // Fetch names for all addresses
        for (const address of addresses) {
          try {
            const user = await getUserByAddress(address);
            if (user) {
              addressMap[address.toLowerCase()] = user.name;
            }
          } catch (error) {
            console.warn(`Failed to get user for address ${address}`, error);
          }
        }

        setUserAddressMap(addressMap);
        setIsLoadingNames(false);
      };

      loadUserNames();
    }, [transactions, getUserByAddress]);

    if (transactions.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No transaction history found</p>
        </div>
      );
    }

    // Format date for display
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    };

    // Get user name with address
    const getUserWithAddress = (address: string | undefined) => {
      if (!address) return "-";

      const truncatedAddress = truncateAddress(address);
      const name = userAddressMap[address.toLowerCase()];

      if (name) {
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">{truncatedAddress}</div>
          </div>
        );
      }

      return truncatedAddress;
    };

    return (
      <div className="overflow-x-auto -mx-6 px-4">
        {" "}
        {/* Negative margin to make table wider than container */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[17%] py-4">Type</TableHead>
              <TableHead className="w-[15%] py-4">From</TableHead>
              <TableHead className="w-[15%] py-4">To</TableHead>
              <TableHead className="w-[15%] py-4">Amount</TableHead>
              <TableHead className="w-[23%] py-4">Time</TableHead>
              <TableHead className="w-[12%] py-4">TX Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingNames ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  <span className="mt-2 block text-sm text-gray-500">
                    Loading user names...
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              displayedTransactions.map((tx, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium py-3 px-4">
                    {formatTransactionType(tx.type)}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {getUserWithAddress(tx.from)}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {getUserWithAddress(tx.to)}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {tx.value ? `${Number(tx.value).toFixed(2)} CHAT` : "-"}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="block">
                      {formatDistanceToNow(tx.timestamp * 1000, {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {formatDate(tx.timestamp)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <a
                      href={`https://holesky.etherscan.io/tx/${tx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-crypto-blue hover:underline"
                    >
                      {truncateAddress(tx.transactionHash)}
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {transactions.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="text-crypto-indigo"
            >
              {showAll
                ? "Show Less"
                : `Show More (${transactions.length - 5} more)`}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading || isLoading) {
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
        <div className="flex items-center mb-4">
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

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-8 sm:p-10 bg-gradient-to-r from-crypto-blue to-crypto-purple">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex flex-col items-center sm:items-start text-white mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold">
                  {profileUser?.name || "User"}
                </h1>
                <p className="text-sm opacity-80 mt-1">
                  {profileUser?.userAddress}
                </p>
              </div>

              {!isOwnProfile && (
                <div className="flex gap-3">
                  {isFriend ? (
                    <>
                      <Button
                        variant="default"
                        className="bg-white text-crypto-indigo hover:bg-gray-100"
                        onClick={startChat}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-transparent border-white text-white hover:bg-white/10"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Friend
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      className="bg-white text-crypto-indigo hover:bg-gray-100"
                      onClick={handleAddFriend}
                      disabled={isAddingFriend}
                    >
                      {isAddingFriend ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Add Friend
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {isOwnProfile && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  Your Token Balance
                </h3>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-crypto-indigo">
                    {Number(tokenBalance).toFixed(2)}
                  </span>
                  <span className="ml-2 text-gray-600">CHAT</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tokens are used for messaging and premium features
                </p>
              </div>
            )}

            {/* Add transaction history section for own profile */}
            {isOwnProfile && (
              <div className="mt-8 mb-8">
                <div className="flex items-center mb-4">
                  <ArrowDownUp className="h-5 w-5 mr-2 text-crypto-indigo" />
                  <h3 className="text-lg font-semibold">Transaction History</h3>
                </div>
                <TransactionHistory transactions={transactions} />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">
                {isOwnProfile
                  ? "Your Friends"
                  : `${profileUser?.name}'s Friends`}
              </h3>

              {isOwnProfile && friends.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    You haven't added any friends yet
                  </p>
                  <Button
                    variant="link"
                    className="mt-2 text-crypto-indigo"
                    onClick={() => navigate("/chat")}
                  >
                    Find people to chat with
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.slice(0, 4).map((friend) => (
                    <div
                      key={friend.userAddress}
                      className="p-3 border border-gray-200 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {friend.userAddress.substring(0, 10)}...
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigate(`/profile/${friend.userAddress}`)
                        }
                        className="text-crypto-indigo"
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {friends.length > 4 && (
                <Button
                  variant="link"
                  className="mt-3 text-crypto-indigo"
                  onClick={() => navigate("/chat")}
                >
                  View all friends
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
};

export default ProfilePage;
