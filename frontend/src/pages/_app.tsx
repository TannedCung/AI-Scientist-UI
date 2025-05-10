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

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps, router } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>AI Scientist Paper Generator</title>
      </Head>
      <ThemeProvider theme={theme}>
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={5000}
        >
          <CssBaseline />
          <NextNProgress
            color={theme.palette.primary.main}
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
          />
          <Layout title={getTitle(router.pathname)}>
            <Component {...pageProps} />
          </Layout>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
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