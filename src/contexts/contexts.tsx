import { createContext } from "react";
import { ethers } from "ethers";
import { User, Message, Transaction } from "./ChatContractContext";

// Context type definition
export interface ChatContractContextType {
  chatContract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  loading: boolean;
  currentAccount: string | null;
  isRegistered: boolean;
  currentUser: User | null;
  tokenBalance: string;
  tokenCooldown: number;
  registerUser: (name: string) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
  addFriend: (friendAddress: string) => Promise<boolean>;
  getFriends: () => Promise<User[]>;
  sendMessage: (
    to: string,
    message: string
  ) => Promise<boolean | { success: boolean; error: string }>;
  getMessages: (friendAddress: string) => Promise<Message[]>;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  checkIfRegistered: () => Promise<boolean>;
  getUserByAddress: (address: string) => Promise<User | null>;
  refreshUserData: () => Promise<void>;
  requestTokens: () => Promise<boolean>;
  fetchTokenBalance: () => Promise<string | void>;
  fetchCooldownTime: () => Promise<void>;
  sendTokensToFriend: (
    friendAddress: string,
    amount: string
  ) => Promise<boolean | { success: boolean; error: string }>;
  getTransactionHistory: () => Promise<Transaction[]>;
}

// Create the context
export const ChatContractContext = createContext<ChatContractContextType>({
  chatContract: null,
  tokenContract: null,
  provider: null,
  signer: null,
  loading: true,
  currentAccount: null,
  isRegistered: false,
  currentUser: null,
  tokenBalance: "0",
  tokenCooldown: 0,
  registerUser: async () => false,
  getAllUsers: async () => [],
  addFriend: async () => false,
  getFriends: async () => [],
  sendMessage: async () => false,
  getMessages: async () => [],
  connectWallet: async () => false,
  disconnectWallet: () => {},
  checkIfRegistered: async () => false,
  getUserByAddress: async () => null,
  refreshUserData: async () => {},
  requestTokens: async () => false,
  fetchTokenBalance: async () => {},
  fetchCooldownTime: async () => {},
  sendTokensToFriend: async () => false,
  getTransactionHistory: async () => [],
});
