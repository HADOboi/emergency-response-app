/// <reference types="vite/client" />

// No environment variables needed as we're using OpenStreetMap (free, no API key required)
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 