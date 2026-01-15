'use client';

import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { useAuth } from '@/store/AuthContext';
import { authApi } from '@/api/auth';
import { ShieldCheck } from 'lucide-react';

export default function HandshakeScreen() {
  const { params, authCode } = useAuth();
  const [completed, setCompleted] = useState(false);

  React.useEffect(() => {
    const exchangeToken = async () => {
      try {
        // En una app real, obtendríamos info del dispositivo de forma más robusta
        const deviceInfo = {
          model: navigator.userAgent.substring(0, 20),
          os: navigator.platform,
          app_version: '1.0.0',
          device_id: 'browser-id-' + Math.random().toString(36).substr(2, 9),
        };

        const response = await authApi.token({
          auth_code: authCode,
          device_info: deviceInfo,
        });

        const { access_token, refresh_token, user } = response.data.data;

        // Persistir tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('device_id', deviceInfo.device_id);

        setCompleted(true);

        // Redirigir a la app de origen con los datos
        setTimeout(() => {
          const redirectUrl = new URL(params.redirectUri || '');
          // Podríamos pasar tokens por fragmento o query dependiendo del requerimiento OAuth
          // Aquí el prompt dice: "Redirigir a 'redirect_uri' entregando el objeto de tokens y perfil de usuario."
          // Lo pasaremos por query param como ejemplo, aunque lo ideal es via postMessage o fragmento seguro.
          redirectUrl.searchParams.append('access_token', access_token);
          redirectUrl.searchParams.append('user', JSON.stringify(user));

          window.location.href = redirectUrl.toString();
        }, 1500);

      } catch (err) {
        console.error('Error in handshake:', err);
      }
    };

    exchangeToken();
  }, [authCode, params.redirectUri]);

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
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
          <Typography variant="body2" sx={{ mt: 4, color: 'primary.main', fontWeight: 600 }}>
            ¡Todo listo! Redirigiendo...
          </Typography>
        )}
      </Box>
    </Container>
  );
}
