'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/api/auth';
import { Box, CircularProgress, Typography, Container, Card, CardContent, Button } from '@mui/material';
import { ShieldAlert } from 'lucide-react';
import Logo from '@/components/Logo';

interface AuthContextType {
  params: {
    redirectUri: string | null;
    clientId: string | null;
    codeChallenge: string | null;
    codeChallengeMethod: string | null;
    uiStyle: string | null;
  };
  username: string;
  setUsername: (username: string) => void;
  authCode: string;
  setAuthCode: (code: string) => void;
  getQueryString: () => string;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [authCode, setAuthCode] = useState('');

  const params = {
    redirectUri: searchParams.get('redirect_uri'),
    clientId: searchParams.get('client_id'),
    codeChallenge: searchParams.get('code_challenge'),
    codeChallengeMethod: searchParams.get('code_challenge_method'),
    uiStyle: searchParams.get('ui_style'),
  };

  const getQueryString = () => {
    const sp = new URLSearchParams();
    if (params.redirectUri) sp.set('redirect_uri', params.redirectUri);
    if (params.clientId) sp.set('client_id', params.clientId);
    if (params.codeChallenge) sp.set('code_challenge', params.codeChallenge);
    if (params.codeChallengeMethod) sp.set('code_challenge_method', params.codeChallengeMethod);
    if (params.uiStyle) sp.set('ui_style', params.uiStyle);

    const qs = sp.toString();
    return qs ? `?${qs}` : '';
  };

  useEffect(() => {
    const validateApp = async () => {
      if (!params.redirectUri || !params.clientId || !params.codeChallenge || !params.codeChallengeMethod) {
        setError('config_error');
        setIsLoading(false);
        return;
      }

      try {
        await authApi.authorize(params.redirectUri, params.clientId);
        setIsLoading(false);
      } catch (err) {
        setError('config_error');
        setIsLoading(false);
      }
    };

    validateApp();
  }, [params.redirectUri]);

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      window.close();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <Logo sx={{ mb: 4 }} />
        <CircularProgress size={40} thickness={4} />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Cargando Medforze...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Card sx={{ width: '100%', textAlign: 'center', p: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <ShieldAlert size={64} color="#f59e0b" />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Error de configuración de la aplicación
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Lo sentimos, no podemos iniciar tu sesión en este momento debido a un problema técnico en el enlace de acceso.
            </Typography>
            <Typography variant="body2" sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'grey.200', color: 'text.secondary' }}>
              Por favor, cierra esta ventana y vuelve a intentarlo desde la aplicación de origen. Si el problema persiste, contacta al soporte técnico de Medforze.
            </Typography>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ mt: 2, px: 4, py: 1, textTransform: 'none', fontWeight: 600 }}
            >
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <AuthContext.Provider value={{ params, username, setUsername, authCode, setAuthCode, getQueryString, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
