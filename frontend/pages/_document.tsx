import { Html, Head, Main, NextScript } from 'next/document';

// Function to generate the runtime config script
function generateRuntimeConfig() {
  return {
    __html: `
      window.__RUNTIME_CONFIG__ = {
        apiUrl: "${process.env.NEXT_PUBLIC_API_URL || '/api'}"
      };
    `
  };
}

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* Inject runtime configuration */}
        <script dangerouslySetInnerHTML={generateRuntimeConfig()} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 