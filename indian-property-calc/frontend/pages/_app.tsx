import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import ChatOverlay from '@/components/ChatOverlay';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';
// All custom styles merged into globals.css for simplicity

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Indian Property Calculator</title>
        <meta name="description" content="Calculate property costs, EMIs, and compare cities across India" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Component {...pageProps} />
      
      <ChatOverlay />
      <Toaster />
    </>
  );
}

export default MyApp;
