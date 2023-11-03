import { type AppType } from "next/app";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { api } from "@/utils/api";

import "@/styles/globals.css";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#111827',
      paper: '#1e293b',
    },
  },
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <Component {...pageProps} />
  </ThemeProvider >);
};

export default api.withTRPC(MyApp);
