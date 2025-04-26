import ChatContractABI from "../../contracts/ChatContract.json";
import TokenContractABI from "../../contracts/TokenContract.json";

export const CONTRACT_ADDRESSES = {
  CHAT: "0x0797Ebf0f6d74aCDB6E5c10443270429B2609651",
  TOKEN: "0x39BE390C81c1bF662A2827604a6528d18133825d",
};

export const CONTRACT_ABIS = {
  CHAT: ChatContractABI,
  TOKEN: TokenContractABI,
};

export const TOKEN_AMOUNTS = {
  MESSAGE_FEE: "0.01", // 0.01 tokens per message
  FAUCET_AMOUNT: "10", // 10 tokens from faucet
};
