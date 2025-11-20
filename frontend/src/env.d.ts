/// <reference types="vite/client" />

// Ye interface TypeScript ko batati hai ki VITE_BACKEND_URL exist karta hai
interface ImportMetaEnv {
    // ✅ VITE_ (prefix) se shuru hone wale variables yahan define hote hain
    readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}