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

// Get runtime configuration based on environment
export const runtimeConfig: RuntimeConfig = {
  // In browser, use window.__RUNTIME_CONFIG__ if available, otherwise use environment variable
  apiUrl: typeof window !== 'undefined' 
    ? (window as any).__RUNTIME_CONFIG__?.apiUrl || process.env.NEXT_PUBLIC_API_URL || '/api'
    : process.env.NEXT_PUBLIC_API_URL || '/api'
}; 