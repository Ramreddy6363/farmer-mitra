/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SARVAM_API_KEY: string;
  readonly VITE_LYZR_API_KEY: string;
  readonly VITE_LYZR_AGENT_ID: string;
  readonly VITE_LYZR_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
