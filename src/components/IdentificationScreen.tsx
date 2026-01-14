'use client';

import React, { useState } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { useAuth } from '@/store/AuthContext';

import { useRouter } from 'next/navigation';

const schema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function IdentificationScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUsername } = useAuth();
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
      if (response.data.payload.exists) {
        router.push('/login');
      } else {
        router.push('/register');
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
        <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
          Medforze
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ingresa tu usuario para continuar
        </Typography>
      </Box>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Usuario"
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
