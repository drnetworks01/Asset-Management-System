declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SITE_URL: string;
    SESSION_PASSWORD: string;
    DATABASE_FILE?: string;
  }
}
