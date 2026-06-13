/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Amazon Associates store id used to build monetized product links. */
  readonly VITE_AMAZON_TAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
