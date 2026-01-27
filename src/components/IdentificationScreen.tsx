'use client';

import React, { useState } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { useAuth } from '@/store/AuthContext';
import Logo from '@/components/Logo';

import { useRouter } from 'next/navigation';

const schema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function IdentificationScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUsername, getQueryString } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.checkIdentifier(data.username);
      setUsername(data.username);
      const queryString = getQueryString();
      if (response.data.payload.exists) {
        router.push(`/login${queryString}`);
      } else {
        router.push(`/register${queryString}`);
      }
    } catch (err) {
      setError('Ocurrió un error al verificar el usuario');
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
              Accede a tu cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Escribe tu nombre de usuario o correo electrónico para acceder a la plataforma
            </Typography>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              autoFocus
              label="Usuario o Correo Electrónico"
              variant="outlined"
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={loading}
              sx={{ mb: 3 }}
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
              {loading ? 'Verificando...' : 'Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
