'use client';

import React, { useState } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box, CircularProgress, Alert, IconButton, InputAdornment } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { useAuth } from '@/store/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
      setAuthCode(response.data.data.auth_code);
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
      <Box sx={{ mt: 8, mb: 4 }}>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => router.push(`/identifier${getQueryString()}`)} sx={{ mb: 2, color: 'text.secondary' }}>
          Volver
        </Button>
        <Typography variant="h4" gutterBottom>
          ¡Hola de nuevo!
        </Typography>
        <Typography variant="body2">
          Ingresa tu contraseña para {username}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
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
            <Button fullWidth variant="text" sx={{ mt: 2, color: 'primary.main', fontWeight: 600 }} onClick={() => { /* Navegar a recuperación */ }}>
              Olvidé mi contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
