'use client';

import LoginScreen from '@/components/LoginScreen';
import { Box } from '@mui/material';

export default function LoginPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <LoginScreen />
    </Box>
  );
}
