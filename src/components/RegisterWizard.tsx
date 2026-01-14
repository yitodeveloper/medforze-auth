'use client';

import React, { useState } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box, Stepper, Step, StepLabel, CircularProgress, Alert, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { useAuth } from '@/store/AuthContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { useRouter } from 'next/navigation';

const steps = ['Contacto', 'Validación', 'Perfil'];

const contactSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono inválido'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'El código debe tener 6 dígitos'),
});

const profileSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  lastname: z.string().min(2, 'Apellido muy corto'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/[A-Z]/, 'Debe tener una mayúscula').regex(/[0-9]/, 'Debe tener un número'),
});

export default function RegisterWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const { params, username, setAuthCode } = useAuth();
  const router = useRouter();

  const contactForm = useForm({ resolver: zodResolver(contactSchema), defaultValues: { email: username.includes('@') ? username : '', phone: '' } });
  const otpForm = useForm({ resolver: zodResolver(otpSchema) });
  const profileForm = useForm({ resolver: zodResolver(profileSchema) });

  const handleContactSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.sendOtp({
        user_identifier: data.email,
        channel: 'email',
        purpose: 'registration'
      });
      setActiveStep(1);
    } catch (err) {
      setError('Error al enviar el código OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.validateOtp({
        user_identifier: contactForm.getValues().email,
        otp_code: data.otp,
        purpose: 'registration'
      });
      setRegistrationToken(response.data.data.action_token);
      setActiveStep(2);
    } catch (err) {
      setError('El código ingresado no es válido. Intenta de nuevo o solicita uno nuevo');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register({
        registration_token: registrationToken,
        name: data.name,
        lastname: data.lastname,
        password: data.password,
        phone: contactForm.getValues().phone,
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
      });
      setAuthCode(response.data.data.auth_code);
      router.push('/handshake');
    } catch (err) {
      setError('Error al completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => router.push('/')} sx={{ mb: 2, color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Typography variant="h4" gutterBottom>
          Crea tu cuenta
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && (
            <form onSubmit={contactForm.handleSubmit(handleContactSubmit)}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                {...contactForm.register('email')}
                error={!!contactForm.formState.errors.email}
                helperText={contactForm.formState.errors.email?.message}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Teléfono Móvil"
                {...contactForm.register('phone')}
                error={!!contactForm.formState.errors.phone}
                helperText={contactForm.formState.errors.phone?.message}
                sx={{ mb: 3 }}
              />
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Siguiente'}
              </Button>
            </form>
          )}

          {activeStep === 1 && (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)}>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Hemos enviado un código de 6 dígitos a <strong style={{ color: '#007BFF' }}>{contactForm.getValues().email}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Código OTP"
                {...otpForm.register('otp')}
                error={!!otpForm.formState.errors.otp}
                helperText={otpForm.formState.errors.otp?.message}
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    letterSpacing: '12px',
                    fontSize: '32px',
                    fontWeight: '700'
                  }
                }}
                sx={{ mb: 3 }}
              />
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar Código'}
              </Button>
            </form>
          )}

          {activeStep === 2 && (
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    {...profileForm.register('name')}
                    error={!!profileForm.formState.errors.name}
                    helperText={profileForm.formState.errors.name?.message}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    {...profileForm.register('lastname')}
                    error={!!profileForm.formState.errors.lastname}
                    helperText={profileForm.formState.errors.lastname?.message}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                type="password"
                label="Contraseña"
                {...profileForm.register('password')}
                error={!!profileForm.formState.errors.password}
                helperText={profileForm.formState.errors.password?.message || 'Min. 8 caracteres, 1 mayúscula, 1 número'}
                sx={{ mb: 3 }}
              />
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Registro'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
