/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
  readonly VITE_DATABASE_URL_UNPOOLED: string;
  readonly NETLIFY_DATABASE_URL: string;
  readonly NETLIFY_DATABASE_URL_UNPOOLED: string;
  readonly VITE_DATABASE_POOL_MIN: string;
  readonly VITE_DATABASE_POOL_MAX: string;
  readonly VITE_DATABASE_POOL_IDLE_TIMEOUT: string;
  readonly VITE_DATABASE_CONNECTION_TIMEOUT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}