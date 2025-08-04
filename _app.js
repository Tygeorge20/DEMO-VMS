import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { RoleProvider } from '../context/RoleContext';
import Navbar from '../components/Navbar';
import '../styles/globals.css';


const theme = createTheme({
  palette: {
    primary: { main: '#ffffff79' },
    secondary: { main: '#ffffff' },
  },
});

export default function MyApp({ Component, pageProps }) {
  return (
    <React.Fragment>
      <Head>
        <title>Vendor Management System</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RoleProvider>
          <Navbar />
          <Component {...pageProps} />
        </RoleProvider>
      </ThemeProvider>
    </React.Fragment>
  );
}