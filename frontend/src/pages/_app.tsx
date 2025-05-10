import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import theme from '../theme/theme';
import Layout from '../components/layout/Layout';
import { SnackbarProvider } from 'notistack';
import NextNProgress from 'nextjs-progressbar';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

// Helper function to get the title based on the current route
function getTitle(pathname: string): string {
  switch (true) {
    case pathname === '/':
      return 'Dashboard';
    case pathname.startsWith('/ideas'):
      if (pathname === '/ideas') return 'Research Ideas';
      if (pathname.includes('/create')) return 'Create Research Idea';
      return 'Research Idea Details';
    case pathname.startsWith('/experiments'):
      return 'Experiment Details';
    case pathname === '/settings':
      return 'Settings';
    default:
      return 'AI Scientist Paper Generator';
  }
} 