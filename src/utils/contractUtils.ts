import { ethers } from "ethers";
import { toast } from "@/components/ui/sonner";
import {
  CONTRACT_ADDRESSES,
  CONTRACT_ABIS,
  TOKEN_AMOUNTS,
} from "./config/contracts";
import { ContractState, User, Message } from "./types/contracts";

export const initializeContracts = async (
  signer: ethers.Signer
): Promise<{
  chatContract: ethers.Contract;
  tokenContract: ethers.Contract;
}> => {
  const chatContract = new ethers.Contract(
    CONTRACT_ADDRESSES.CHAT,
    CONTRACT_ABIS.CHAT,
    signer
  );

  const tokenContract = new ethers.Contract(
    CONTRACT_ADDRESSES.TOKEN,
    CONTRACT_ABIS.TOKEN,
    signer
  );

  return { chatContract, tokenContract };
};

export const handleTransaction = async (
  txPromise: Promise<ethers.ContractTransaction>,
  successMessage: string,
  errorMessage: string
): Promise<boolean> => {
  try {
    const tx = await txPromise;
    await tx.wait();
    toast.success(successMessage);
    return true;
  } catch (error) {
    console.error(errorMessage, error);
    toast.error(errorMessage);
    return false;
  }
};

export const checkNetworkConnection = async (
  provider: ethers.providers.Web3Provider
): Promise<boolean> => {
  try {
    await provider.getBlockNumber();
    return true;
  } catch (error) {
    console.error("Network connection error:", error);
    toast.error("Connection to blockchain failed. Please check your network.");
    return false;
  }
};

export const approveTokens = async (
  tokenContract: ethers.Contract,
  spender: string,
  amount: string
): Promise<boolean> => {
  try {
    const approveTx = await tokenContract.approve(
      spender,
      ethers.utils.parseEther(amount)
    );
    await approveTx.wait();
    return true;
  } catch (error) {
    console.error("Token approval failed:", error);
    toast.error("Failed to approve tokens");
    return false;
  }
};

export const formatMessage = (message: {
  sender: string;
  receiver: string;
  content: string;
  timestamp: ethers.BigNumber;
}): Message => ({
  sender: message.sender,
  receiver: message.receiver,
  content: message.content,
  timestamp: message.timestamp.toNumber(),
});
