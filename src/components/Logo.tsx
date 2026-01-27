'use client';

import React from 'react';
import { Box, useTheme, SxProps, Theme } from '@mui/material';

interface LogoProps {
  sx?: SxProps<Theme>;
}

const LOGO_DARK = 'https://medforze.s3.us-west-2.amazonaws.com/logos/logo_dark_small.png';
const LOGO_LIGHT = 'https://medforze.s3.us-west-2.amazonaws.com/logos/logo_light_small.png';

export default function Logo({ sx }: LogoProps) {
  const theme = useTheme();
  // Si el modo es oscuro (dark), mostramos el logo light (blanco)
  // Si el modo es claro (light), mostramos el logo dark (negro/azul)
  const logoSrc = theme.palette.mode === 'dark' ? LOGO_LIGHT : LOGO_DARK;

  return (
    <Box
      component="img"
      src={logoSrc}
      alt="Medforze Logo"
      sx={{
        height: 64,
        width: 'auto',
        mx: 'auto',
        ...sx
      }}
    />
  );
}
