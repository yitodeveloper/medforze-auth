'use client';

import { ThemeContextProvider } from '@/store/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeSwitch from '@/components/ThemeSwitch';
import { Box } from '@mui/material';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1100 }}>
        <ThemeSwitch />
      </Box>
      {children}
    </ThemeContextProvider>
  );
}
