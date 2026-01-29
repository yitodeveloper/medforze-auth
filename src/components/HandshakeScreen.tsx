'use client';

import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Container, Button } from '@mui/material';
import { useAuth } from '@/store/AuthContext';
import { ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo';

export default function HandshakeScreen() {
  const { params, authCode } = useAuth();
  const [completed, setCompleted] = useState(false);

  React.useEffect(() => {
    if (authCode && params.redirectUri) {
      setCompleted(true);

      const timer = setTimeout(() => {
        try {
          if (params.redirectUri) {
            const redirectUrl = new URL(params.redirectUri);
            redirectUrl.searchParams.append('code', authCode);

            const finalUrl = redirectUrl.toString();
            const isAndroid = /Android/i.test(navigator.userAgent);

            if (isAndroid && finalUrl.startsWith('medforze://')) {
              // Redirección usando Intent para Android para asegurar que abra la app
              const intentUrl = `intent://auth${redirectUrl.search}#Intent;scheme=medforze;package=com.medforze.app;end;`;
              window.location.href = intentUrl;
            } else {
              window.location.href = finalUrl;
            }
          }
        } catch (err) {
          console.error('Invalid redirect URI:', err);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [authCode, params.redirectUri]);

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 6 }}>
          {/* Logo */}
          <Logo />
        </Box>
        <Box sx={{ mb: 4, position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size={80}
            thickness={2}
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={40} color="#007BFF" className="loading-pulse" />
          </Box>
        </Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Iniciando sesión segura...
        </Typography>
        <Typography variant="body2">
          Validando identidad y configurando tu espacio de salud.
        </Typography>
        {completed && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
              ¡Todo listo! Redirigiendo...
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                const redirectUrl = new URL(params.redirectUri!);
                redirectUrl.searchParams.append('code', authCode);
                const finalUrl = redirectUrl.toString();
                const isAndroid = /Android/i.test(navigator.userAgent);
                if (isAndroid && finalUrl.startsWith('medforze://')) {
                  window.location.href = `intent://auth${redirectUrl.search}#Intent;scheme=medforze;package=com.medforze.app;end;`;
                } else {
                  window.location.href = finalUrl;
                }
              }}
              sx={{ textTransform: 'none' }}
            >
              ¿No fuiste redirigido? Haz clic aquí
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
