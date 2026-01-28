'use client';

import React, { useState } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box, CircularProgress, Alert, IconButton, InputAdornment } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { useAuth } from '@/store/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

import { useRouter } from 'next/navigation';

const schema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { params, username, setAuthCode, getQueryString } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login({
        username,
        password: data.password,
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
      });
      setAuthCode(response.data.payload.auth_code);
      router.push(`/handshake${getQueryString()}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Contraseña incorrecta');
      } else {
        setError('Ocurrió un error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          {/* Logo */}
          <Logo />
        </Box>

      </Box>
      <Card>
        <CardContent>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              ¡Hola de nuevo!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tu contraseña para {username}
            </Typography>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden username field for password managers */}
            <input
              type="hidden"
              autoComplete="username"
              value={username || ''}
              {...register('username' as any)}
            />
            <TextField
              fullWidth
              label="Contraseña"
              autoFocus
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            <Button
                fullWidth
                sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}
                startIcon={<ArrowLeft size={18} />}
                onClick={() => router.push(`/identifier${getQueryString()}`)}
            >
              Volver
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 2, color: 'primary.main', fontWeight: 600 }}
              onClick={() => router.push(`/forgot-password${getQueryString()}`)}
            >
              Olvidé mi contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
