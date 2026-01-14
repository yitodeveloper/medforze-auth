'use client';

import React from 'react';
import IdentificationScreen from '@/components/IdentificationScreen';
import { Box } from '@mui/material';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <IdentificationScreen />
    </Box>
  );
}
