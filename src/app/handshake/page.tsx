'use client';

import HandshakeScreen from '@/components/HandshakeScreen';
import { Box } from '@mui/material';

export default function HandshakePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <HandshakeScreen />
    </Box>
  );
}
