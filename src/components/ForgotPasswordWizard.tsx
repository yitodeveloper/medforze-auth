'use client';

import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box, Stepper, Step, StepLabel, CircularProgress, Alert, InputAdornment, IconButton, LinearProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { useAuth } from '@/store/AuthContext';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, User, KeyRound } from 'lucide-react';
import Logo from '@/components/Logo';
import { useRouter } from 'next/navigation';

const steps = ['Identificación', 'Verificación', 'Nueva Contraseña'];

const identifierSchema = z.object({
  username: z.string().min(1, 'El identificador es requerido'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'El código debe tener 6 dígitos'),
});

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener una mayúscula')
    .regex(/[a-z]/, 'Debe tener una minúscula')
    .regex(/[0-9]/, 'Debe tener un número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const passwordRequirements = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (val: string) => val.length >= 8 },
  { id: 'uppercase', label: 'Al menos una mayúscula', test: (val: string) => /[A-Z]/.test(val) },
  { id: 'lowercase', label: 'Al menos una minúscula', test: (val: string) => /[a-z]/.test(val) },
  { id: 'number', label: 'Al menos un número', test: (val: string) => /[0-9]/.test(val) },
];

export default function ForgotPasswordWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { params, username, setUsername, setAuthCode, getQueryString } = useAuth();
  const router = useRouter();

  const identifierForm = useForm({
    resolver: zodResolver(identifierSchema),
    defaultValues: { username: username || '' }
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleIdentifierSubmit = async (data: { username: string }) => {
    setLoading(true);
    setError(null);
    try {
      setUsername(data.username);
      await authApi.forgotPassword(data.username);
      setSuccessMsg('Si el usuario existe, hemos enviado un código a su medio de contacto');
      setActiveStep(1);
      setTimer(60);
    } catch (err) {
      // Según requerimiento: La API responderá exitosamente siempre.
      // Si por alguna razón falla el llamado mismo (network error):
      setError('Ocurrió un error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data: { otp: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.validateOtp({
        user_identifier: username,
        otp_code: data.otp,
        purpose: 'password_reset'
      });
      setResetToken(response.data.payload.action_token);
      setActiveStep(2);
    } catch (err) {
      setError('Código OTP inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(username);
      setTimer(60);
      setSuccessMsg('Código reenviado con éxito');
    } catch (err) {
      setError('Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.resetPassword({
        reset_token: resetToken,
        new_password: data.password,
        code_challenge: params.codeChallenge,
        code_challenge_method: params.codeChallengeMethod
      });
      setAuthCode(response.data.payload.auth_code);
      router.push(`/handshake${getQueryString()}`);
    } catch (err) {
      setError('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <form onSubmit={identifierForm.handleSubmit(handleIdentifierSubmit)}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Ingresa tu correo electrónico o nombre de usuario para recibir un código de recuperación.
            </Typography>
            <TextField
              fullWidth
              autoFocus
              label="Correo o Usuario"
              {...identifierForm.register('username')}
              error={!!identifierForm.formState.errors.username}
              helperText={identifierForm.formState.errors.username?.message}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} color="#94a3b8" />
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
              {loading ? 'Enviando...' : 'Enviar Código'}
            </Button>
          </form>
        );
      case 1:
        return (
          <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Hemos enviado un código de 6 dígitos a tu medio de contacto. Ingrésalo a continuación.
            </Typography>
            {successMsg && <Alert severity="info" sx={{ mb: 3 }}>{successMsg}</Alert>}

            <Controller
              name="otp"
              control={otpForm.control}
              render={({ field }) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TextField
                      key={index}
                      id={`otp-input-${index}`}
                      inputProps={{
                        maxLength: 1,
                        style: { textAlign: 'center', fontSize: '1.5rem', padding: '10px' }
                      }}
                      sx={{ width: '45px' }}
                      value={field.value[index] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !/^\d$/.test(val)) return;

                        const newOtp = field.value.split('');
                        newOtp[index] = val;
                        const finalOtp = newOtp.join('');
                        field.onChange(finalOtp);

                        if (val && index < 5) {
                          const nextInput = document.getElementById(`otp-input-${index + 1}`);
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !field.value[index] && index > 0) {
                          const prevInput = document.getElementById(`otp-input-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      autoFocus={index === 0}
                      disabled={loading}
                    />
                  ))}
                </Box>
              )}
            />

            {otpForm.formState.errors.otp && (
              <Typography color="error" variant="caption" display="block" sx={{ textAlign: 'center', mb: 2 }}>
                {otpForm.formState.errors.otp.message}
              </Typography>
            )}

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading || otpForm.watch('otp').length !== 6}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ mb: 2 }}
            >
              Verificar Código
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleResendOtp}
              disabled={timer > 0 || loading}
            >
              {timer > 0 ? `Reenviar código en ${timer}s` : 'Reenviar código'}
            </Button>
          </form>
        );
      case 2:
        const currentPassword = passwordForm.watch('password');
        return (
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Crea una nueva contraseña para tu cuenta.
            </Typography>

            <TextField
              fullWidth
              autoFocus
              label="Nueva Contraseña"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...passwordForm.register('password')}
              error={!!passwordForm.formState.errors.password}
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock size={20} color="#94a3b8" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mb: 3 }}>
              {passwordRequirements.map((req) => {
                const isMet = req.test(currentPassword || '');
                return (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CheckCircle2 size={14} color={isMet ? '#22c55e' : '#cbd5e1'} />
                    <Typography variant="caption" sx={{ color: isMet ? 'success.main' : 'text.secondary' }}>
                      {req.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <TextField
              fullWidth
              label="Confirmar Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...passwordForm.register('confirmPassword')}
              error={!!passwordForm.formState.errors.confirmPassword}
              helperText={passwordForm.formState.errors.confirmPassword?.message}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><KeyRound size={20} color="#94a3b8" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>
          </form>
        );
      default:
        return null;
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
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
            Recuperar Contraseña
          </Typography>
          <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStep()}
            <Button
                fullWidth
                startIcon={<ArrowLeft size={18} />}
                onClick={() => {
                    if (activeStep > 0) setActiveStep(activeStep - 1);
                    else router.push(`/login${getQueryString()}`);
                }}
                sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}
            >
                Volver
            </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
