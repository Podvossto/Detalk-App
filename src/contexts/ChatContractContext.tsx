/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext, ReactNode } from "react";
import { ethers } from "ethers";
import { toast } from "@/components/ui/sonner";
import ChatContractABI from "../contracts/ChatContract.json";
import TokenContractABI from "../contracts/TokenContract.json";
import { ChatContractContext, ChatContractContextType } from "./contexts";

// Contract addresses
const CHAT_CONTRACT_ADDRESS = "0x47C4bdBb0977D926b956e0D6735FB3e6aA49d0e2";
const TOKEN_CONTRACT_ADDRESS = "0x2C6c792ED415d7360e783761a425FACaa2B4343C";

// User type definition
export interface User {
  name: string;
  userAddress: string;
  exists: boolean;
}

// Message type definition
export interface Message {
  sender: string;
  receiver: string;
  content: string;
  timestamp: number;
}

// Raw message from contract
interface RawMessage {
  sender: string;
  receiver: string;
  content: string;
  timestamp: ethers.BigNumber;
}

// Contract User type
interface ContractUser {
  name: string;
  userAddress: string;
  exists: boolean;
}

export interface Transaction {
  type:
    | "TokenSent"
    | "TokenReceived"
    | "MessageSent"
    | "TokenRequested"
    | "FriendAdded";
  from?: string;
  to?: string;
  value?: string;
  timestamp: number;
  transactionHash: string;
}

interface ChatContractProviderProps {
  children: ReactNode;
}

export const ChatContractProvider = ({
  children,
}: ChatContractProviderProps) => {
  const [chatContract, setChatContract] = useState<ethers.Contract | null>(
    null
  );
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(
    null
  );
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [tokenCooldown, setTokenCooldown] = useState<number>(0);

  // Handle account changes in MetaMask
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setCurrentAccount(null);
      setIsRegistered(false);
      setCurrentUser(null);
    } else {
      const account = accounts[0];
      setCurrentAccount(account);
      if (chatContract) {
        const registered = await chatContract.isRegistered(account);
        setIsRegistered(registered);
        if (registered) {
          try {
            const user = await chatContract.getUserByAddress(account);
            setCurrentUser({
              name: user.name,
              userAddress: user.userAddress,
              exists: user.exists,
            });
          } catch (error) {
            console.error("Error fetching user data:", error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    }
  };

  // Fetch token balance
  const fetchTokenBalance = async (): Promise<string | void> => {
    if (!tokenContract || !currentAccount) return;

    try {
      const balance = await tokenContract.balanceOf(currentAccount);
      const formattedBalance = ethers.utils.formatEther(balance);
      setTokenBalance(formattedBalance);

      // Return the new balance value (for components that need it immediately)
      return formattedBalance;
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  // Fetch cooldown time
  const fetchCooldownTime = async (): Promise<void> => {
    if (!tokenContract || !currentAccount) return;

    try {
      const cooldown = await tokenContract.getCooldownRemaining();
      setTokenCooldown(cooldown.toNumber());
    } catch (error) {
      console.error("Error fetching cooldown time:", error);
    }
  };

  // Connect wallet function
  const connectWallet = async (): Promise<boolean> => {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
        const web3Signer = web3Provider.getSigner();
        const address = await web3Signer.getAddress();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setCurrentAccount(address);

        const chat = new ethers.Contract(
          CHAT_CONTRACT_ADDRESS,
          ChatContractABI,
          web3Signer
        );

        const token = new ethers.Contract(
          TOKEN_CONTRACT_ADDRESS,
          TokenContractABI,
          web3Signer
        );

        setChatContract(chat);
        setTokenContract(token);

        // Check if user is registered
        const registered = await chat.isRegistered(address);
        setIsRegistered(registered);

        if (registered) {
          try {
            const user = await chat.getUserByAddress(address);
            setCurrentUser({
              name: user.name,
              userAddress: user.userAddress,
              exists: user.exists,
            });
          } catch (error) {
            console.error("Error fetching user data:", error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }

        setLoading(false);
        return true;
      } else {
        toast.error(
          "Ethereum wallet not detected. Please install MetaMask or another wallet."
        );
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
      setLoading(false);
      return false;
    }
  };

  // Initialize blockchain connection
  useEffect(() => {
    const init = async () => {
      try {
        await connectWallet();
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
      }
    };

    init();

    // Setup event listener for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  // Fetch token balance when account or contract changes
  useEffect(() => {
    if (currentAccount && tokenContract) {
      fetchTokenBalance();
      fetchCooldownTime();
    }
  }, [currentAccount, tokenContract]);

  // Disconnect wallet function
  const disconnectWallet = () => {
    setChatContract(null);
    setTokenContract(null);
    setProvider(null);
    setSigner(null);
    setCurrentAccount(null);
    setIsRegistered(false);
    setCurrentUser(null);
    setLoading(false);

    // Clear local session data
    localStorage.removeItem("walletConnected");
    sessionStorage.clear();
  };

  // Check if user is registered
  const checkIfRegistered = async (): Promise<boolean> => {
    if (!chatContract || !currentAccount) return false;
    try {
      const registered = await chatContract.isRegistered(currentAccount);
      setIsRegistered(registered);
      return registered;
    } catch (error) {
      console.error("Error checking registration:", error);
      return false;
    }
  };

  // Register user function
  const registerUser = async (name: string): Promise<boolean> => {
    if (!chatContract || !currentAccount) return false;
    try {
      const tx = await chatContract.registerUser(name);
      toast.success(
        "Registration transaction sent! Please wait for confirmation."
      );

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setIsRegistered(true);
        const user = await chatContract.getUserByAddress(currentAccount);
        setCurrentUser({
          name: user.name,
          userAddress: user.userAddress,
          exists: user.exists,
        });
        toast.success("Registration successful!");
        return true;
      } else {
        toast.error("Registration failed");
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
      return false;
    }
  };

  // Get user by address
  const getUserByAddress = async (address: string): Promise<User | null> => {
    if (!chatContract) return null;
    try {
      const user = await chatContract.getUserByAddress(address);
      if (user.exists) {
        return {
          name: user.name,
          userAddress: user.userAddress,
          exists: user.exists,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  // Get all registered users
  const getAllUsers = async (): Promise<User[]> => {
    if (!chatContract) return [];
    try {
      const users = await chatContract.getAllUsers();
      return users.map((user: ContractUser) => ({
        name: user.name,
        userAddress: user.userAddress,
        exists: user.exists,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  // Add friend function
  const addFriend = async (friendAddress: string): Promise<boolean> => {
    if (!chatContract || !currentAccount) return false;
    try {
      const tx = await chatContract.addFriend(friendAddress);
      toast.success("Friend request sent! Please wait for confirmation.");

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast.success("Friend added successfully!");
        return true;
      } else {
        toast.error("Failed to add friend");
        return false;
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Failed to add friend");
      return false;
    }
  };

  // Get friends list
  const getFriends = async (): Promise<User[]> => {
    if (!chatContract || !currentAccount) return [];
    try {
      const friendUsers = await chatContract.getFriends();
      return friendUsers.map((user: ContractUser) => ({
        name: user.name,
        userAddress: user.userAddress,
        exists: user.exists,
      }));
    } catch (error) {
      console.error("Error fetching friends:", error);
      return [];
    }
  };

  // Send message function
  const sendMessage = async (
    to: string,
    message: string
  ): Promise<boolean | { success: boolean; error: string }> => {
    if (!chatContract || !tokenContract || !currentAccount) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      // First check token balance
      const balance = await tokenContract.balanceOf(currentAccount);
      const messageFee = ethers.utils.parseEther("0.01"); // 0.01 tokens per message

      if (balance.lt(messageFee)) {
        return {
          success: false,
          error: "Insufficient tokens.",
        };
      }

      // Approve the chat contract to spend tokens
      try {
        const allowance = await tokenContract.allowance(
          currentAccount,
          CHAT_CONTRACT_ADDRESS
        );

        if (allowance.lt(messageFee)) {
          const approveTx = await tokenContract.approve(
            CHAT_CONTRACT_ADDRESS,
            messageFee
          );
          await approveTx.wait();
        }
      } catch (error) {
        console.error("Error approving token transfer:", error);
        return {
          success: false,
          error: "Failed to approve token transfer",
        };
      }

      // Now send the message
      const tx = await chatContract.sendMessage(to, message);
      toast.success("Message sent! Waiting for confirmation...");

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast.success("Message delivered successfully!");
        await fetchTokenBalance();
        return true;
      } else {
        toast.error("Message delivery failed");
        return false;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return { success: false, error: "Transaction failed" };
    }
  };

  // Get messages function
  const getMessages = async (friendAddress: string): Promise<Message[]> => {
    if (!chatContract || !currentAccount) return [];
    try {
      const messages = await chatContract.getMessages(friendAddress);
      return messages.map((msg: RawMessage) => ({
        sender: msg.sender,
        receiver: msg.receiver,
        content: msg.content,
        timestamp: msg.timestamp.toNumber(),
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  // Refresh user data
  const refreshUserData = async (): Promise<void> => {
    if (!chatContract || !currentAccount) return;
    try {
      const registered = await chatContract.isRegistered(currentAccount);
      setIsRegistered(registered);

      if (registered) {
        const user = await chatContract.getUserByAddress(currentAccount);
        setCurrentUser({
          name: user.name,
          userAddress: user.userAddress,
          exists: user.exists,
        });
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Request tokens from faucet
  const requestTokens = async (): Promise<boolean> => {
    if (!tokenContract || !currentAccount) return false;
    try {
      const tx = await tokenContract.requestTokens();
      toast.success("Token request sent! Please wait for confirmation.");

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast.success("Tokens received successfully!");
        // Update balance and cooldown immediately with await
        await fetchTokenBalance();
        await fetchCooldownTime();
        return true;
      } else {
        toast.error("Failed to request tokens");
        return false;
      }
    } catch (error: unknown) {
      console.error("Error requesting tokens:", error);
      if (error instanceof Error) {
        toast.error(`Failed to request tokens: ${error.message}`);
      } else {
        toast.error("Failed to request tokens");
      }
      return false;
    }
  };

  const sendTokensToFriend = async (
    friendAddress: string,
    amount: string
  ): Promise<boolean | { success: boolean; error: string }> => {
    if (!chatContract || !tokenContract || !currentAccount) {
      return { success: false, error: "Not connected" };
    }

    try {
      // Use toast loading state instead of global loading state
      // which prevents full page loading screen
      toast.loading("Checking friendship status...");

      // Check if the user is a friend
      const isFriend = await chatContract.checkFriendship(
        currentAccount,
        friendAddress
      );
      if (!isFriend) {
        toast.dismiss();
        toast.error("You can only send tokens to friends");
        return { success: false, error: "You can only send tokens to friends" };
      }

      // Check token balance first
      toast.dismiss();
      toast.loading("Checking token balance...");
      const balance = await tokenContract.balanceOf(currentAccount);
      const amountInWei = ethers.utils.parseEther(amount);

      if (balance.lt(amountInWei)) {
        toast.dismiss();
        toast.error("Insufficient token balance");
        return { success: false, error: "Insufficient token balance" };
      }

      // Show toast notification for the pending transaction
      toast.dismiss();
      toast.loading("Approving token transfer...");

      // First, approve the chat contract to spend tokens
      const approveTx = await tokenContract.approve(
        CHAT_CONTRACT_ADDRESS,
        amountInWei
      );
      await approveTx.wait();

      // Update toast for the next step
      toast.dismiss();
      toast.loading("Sending tokens to friend...");

      // Then send the tokens
      const tx = await chatContract.sendTokensToFriend(
        friendAddress,
        amountInWei
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Dismiss loading toast
      toast.dismiss();

      if (receipt.status === 1) {
        // Refresh token balance
        await fetchTokenBalance();
        toast.success(`Successfully sent ${amount} CHAT tokens`);
        return true;
      } else {
        toast.error("Transaction failed");
        return { success: false, error: "Transaction failed" };
      }
    } catch (error: unknown) {
      // Dismiss any active loading toasts
      toast.dismiss();

      console.error("Error sending tokens:", error);
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        // Extract meaningful error message
        const message = error.message;
        if (message.includes("user rejected transaction")) {
          errorMessage = "Transaction was rejected";
        } else if (message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for gas";
        } else {
          errorMessage = message.split("(")[0].trim(); // Get first part of error message
        }
      }

      toast.error(`Failed to send tokens: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Get transaction history for current user
  const getTransactionHistory = async (): Promise<Transaction[]> => {
    if (!chatContract || !tokenContract || !currentAccount || !provider)
      return [];

    const transactions: Transaction[] = [];

    try {
      // Use a recent block number instead of 0 to avoid timeout
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 10000); // Look back ~10000 blocks only

      try {
        // Get token transfers sent by user
        const sentTokenFilter = tokenContract.filters.Transfer(
          currentAccount,
          null
        );
        const sentTokenEvents = await tokenContract.queryFilter(
          sentTokenFilter,
          fromBlock
        );

        // Process token transfers sent by user
        for (const event of sentTokenEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            if (event.args) {
              transactions.push({
                type: "TokenSent",
                from: event.args[0],
                to: event.args[1],
                value: ethers.utils.formatEther(event.args[2]),
                timestamp: block.timestamp,
                transactionHash: event.transactionHash,
              });
            }
          } catch (err) {
            console.warn("Error processing sent token event:", err);
          }
        }
      } catch (err) {
        console.warn("Error fetching sent token events:", err);
      }

      try {
        // Get token transfers received by user
        const receivedTokenFilter = tokenContract.filters.Transfer(
          null,
          currentAccount
        );
        const receivedTokenEvents = await tokenContract.queryFilter(
          receivedTokenFilter,
          fromBlock
        );

        // Process token transfers received by user
        for (const event of receivedTokenEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            if (event.args) {
              transactions.push({
                type: "TokenReceived",
                from: event.args[0],
                to: event.args[1],
                value: ethers.utils.formatEther(event.args[2]),
                timestamp: block.timestamp,
                transactionHash: event.transactionHash,
              });
            }
          } catch (err) {
            console.warn("Error processing received token event:", err);
          }
        }
      } catch (err) {
        console.warn("Error fetching received token events:", err);
      }

      try {
        // Get token request events
        const tokenRequestFilter =
          tokenContract.filters.TokensRequested(currentAccount);
        const tokenRequestEvents = await tokenContract.queryFilter(
          tokenRequestFilter,
          fromBlock
        );

        // Process token requests
        for (const event of tokenRequestEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            if (event.args) {
              transactions.push({
                type: "TokenRequested",
                to: event.args[0],
                value: ethers.utils.formatEther(event.args[1]),
                timestamp: block.timestamp,
                transactionHash: event.transactionHash,
              });
            }
          } catch (err) {
            console.warn("Error processing token request event:", err);
          }
        }
      } catch (err) {
        console.warn("Error fetching token request events:", err);
      }

      try {
        // Get messages sent by user
        const sentMessageFilter = chatContract.filters.MessageSent(
          currentAccount,
          null
        );
        const sentMessageEvents = await chatContract.queryFilter(
          sentMessageFilter,
          fromBlock
        );

        // Process message sent events
        for (const event of sentMessageEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            if (event.args) {
              transactions.push({
                type: "MessageSent",
                from: event.args[0],
                to: event.args[1],
                timestamp: block.timestamp,
                transactionHash: event.transactionHash,
              });
            }
          } catch (err) {
            console.warn("Error processing message sent event:", err);
          }
        }
      } catch (err) {
        console.warn("Error fetching message sent events:", err);
      }

      try {
        // Get friend added events
        const friendAddedFilter = chatContract.filters.FriendAdded(
          currentAccount,
          null
        );
        const friendAddedEvents = await chatContract.queryFilter(
          friendAddedFilter,
          fromBlock
        );

        // Process friend added events
        for (const event of friendAddedEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            if (event.args) {
              transactions.push({
                type: "FriendAdded",
                to: event.args[1],
                timestamp: block.timestamp,
                transactionHash: event.transactionHash,
              });
            }
          } catch (err) {
            console.warn("Error processing friend added event:", err);
          }
        }
      } catch (err) {
        console.warn("Error fetching friend added events:", err);
      }

      // Sort transactions by timestamp in descending order (newest first)
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      // Return whatever transactions we have managed to collect
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
  };

  return (
    <ChatContractContext.Provider
      value={{
        chatContract,
        tokenContract,
        provider,
        signer,
        loading,
        currentAccount,
        isRegistered,
        currentUser,
        tokenBalance,
        tokenCooldown,
        registerUser,
        getAllUsers,
        addFriend,
        getFriends,
        sendMessage,
        getMessages,
        connectWallet,
        disconnectWallet,
        checkIfRegistered,
        getUserByAddress,
        refreshUserData,
        requestTokens,
        fetchTokenBalance,
        fetchCooldownTime,
        sendTokensToFriend,
        getTransactionHistory,
      }}
    >
      {children}
    </ChatContractContext.Provider>
  );
};

export const useChatContract = () =>
  useContext<ChatContractContextType>(ChatContractContext);
