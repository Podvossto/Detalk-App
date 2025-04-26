import { ethers } from "ethers";

export interface User {
  name: string;
  userAddress: string;
  exists: boolean;
}

export interface Message {
  sender: string;
  receiver: string;
  content: string;
  timestamp: number;
}

export interface ContractState {
  chatContract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  currentAccount: string | null;
  isRegistered: boolean;
  currentUser: User | null;
  loading: boolean;
  tokenBalance?: number;
}

export interface ContractFunctions {
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
  checkIfRegistered: () => Promise<boolean>;
  getUserByAddress: (address: string) => Promise<User | null>;
  refreshUserData: () => Promise<void>;
  requestTokens: () => Promise<boolean>;
}
