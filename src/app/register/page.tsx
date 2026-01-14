'use client';

import RegisterWizard from '@/components/RegisterWizard';
import { Box } from '@mui/material';

export default function RegisterPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <RegisterWizard />
    </Box>
  );
}
