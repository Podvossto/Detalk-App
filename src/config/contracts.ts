import ChatContractABI from "../contracts/ChatContract.json";
import TokenContractABI from "../contracts/TokenContract.json";

const env = import.meta.env;

export const CONTRACT_ADDRESSES = {
  CHAT: env.VITE_CHAT_CONTRACT_ADDRESS as string,
  TOKEN: env.VITE_TOKEN_CONTRACT_ADDRESS as string,
};

export const CONTRACT_ABIS = {
  CHAT: ChatContractABI,
  TOKEN: TokenContractABI,
};

export const TOKEN_AMOUNTS = {
  MESSAGE_FEE: "0.01",
  FAUCET_AMOUNT: "10",
};

export const CHAIN = {
  ID: Number(env.VITE_CHAIN_ID ?? 11155111),
  NAME: (env.VITE_CHAIN_NAME as string) ?? "Sepolia",
};

export const isConfigured = Boolean(
  CONTRACT_ADDRESSES.CHAT && CONTRACT_ADDRESSES.TOKEN
);
