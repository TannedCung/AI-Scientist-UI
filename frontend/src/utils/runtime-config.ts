/**
 * This file provides runtime configuration for the application.
 * It allows environment variables to be overridden at runtime rather than build time.
 */

// Define the RuntimeConfig interface
interface RuntimeConfig {
  apiUrl: string;
}

// Define the global window interface
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

// Function to get the runtime configuration
export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window !== 'undefined') {
    // We're in the browser
    return {
      apiUrl: window.__RUNTIME_CONFIG__?.apiUrl || process.env.NEXT_PUBLIC_API_URL || '/api'
    };
  }
  
  // We're on the server
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api'
  };
}

// Export the current runtime config
export const runtimeConfig = getRuntimeConfig(); 