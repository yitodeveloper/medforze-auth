'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/api/auth';
import { Box, CircularProgress, Typography, Container, Card, CardContent } from '@mui/material';
import { AlertCircle } from 'lucide-react';

interface AuthContextType {
  params: {
    redirectUri: string | null;
    codeChallenge: string | null;
    codeChallengeMethod: string | null;
    codeVerifier: string | null;
  };
  username: string;
  setUsername: (username: string) => void;
  authCode: string;
  setAuthCode: (code: string) => void;
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
    codeChallenge: searchParams.get('code_challenge'),
    codeChallengeMethod: searchParams.get('code_challenge_method'),
    codeVerifier: searchParams.get('code_verifier'),
  };

  useEffect(() => {
    const validateApp = async () => {
      if (!params.redirectUri || !params.codeChallenge || !params.codeChallengeMethod || !params.codeVerifier) {
        // En una app real de OAuth, estos parámetros son obligatorios desde el inicio
        // Si no vienen, podrías decidir si fallar o permitir navegación interna.
        // El prompt dice que son obligatorios.
        setIsLoading(false);
        return;
      }

      try {
        await authApi.authorize(params.redirectUri);
        setIsLoading(false);
      } catch (err) {
        setError('Aplicación no autorizada');
        setIsLoading(false);
      }
    };

    validateApp();
  }, [params.redirectUri]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Cargando Medforze...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Card sx={{ width: '100%', textAlign: 'center', p: 4, borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
          <CardContent>
            <AlertCircle size={48} color="#DC3545" />
            <Typography variant="h5" color="error" sx={{ mt: 2, fontWeight: 700 }}>
              Error Crítico
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <AuthContext.Provider value={{ params, username, setUsername, authCode, setAuthCode, isLoading, error }}>
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
