declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      ADMIN_PASSWORD?: string;
    }
  }

  var process: {
    env: NodeJS.ProcessEnv;
  };
}

export {};