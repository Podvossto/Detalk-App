/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_CONTRACT_ADDRESS?: string;
  readonly VITE_TOKEN_CONTRACT_ADDRESS?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_CHAIN_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
