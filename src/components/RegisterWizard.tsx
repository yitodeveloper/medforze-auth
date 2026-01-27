'use client';

import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box, Stepper, Step, StepLabel, CircularProgress, Alert, Grid, Select, MenuItem, InputAdornment, FormControl, InputLabel } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth';
import { useAuth } from '@/store/AuthContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';

import { useRouter } from 'next/navigation';

const countries = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá' },
  { code: '+1', flag: '🇩🇴', name: 'República Dominicana' },
];

const steps = ['Contacto', 'Validación Email', 'Validación Teléfono', 'Perfil'];

const contactSchema = z.object({
  email: z.string().email('Email inválido'),
  countryCode: z.string().min(1, 'Requerido'),
  phone: z.string().min(7, 'Teléfono inválido'),
});

const emailOtpSchema = z.object({
  otp: z.string().length(6, 'El código debe tener 6 dígitos'),
});

const phoneOtpSchema = z.object({
  otp: z.string().length(6, 'El código debe tener 6 dígitos'),
});

const profileSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  lastname: z.string().min(2, 'Apellido muy corto'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener una mayúscula')
    .regex(/[a-z]/, 'Debe tener una minúscula')
    .regex(/[0-9]/, 'Debe tener un número')
    .regex(/[^A-Za-z0-9]/, 'Debe tener un carácter especial'),
});

const passwordRequirements = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (val: string) => val.length >= 8 },
  { id: 'uppercase', label: 'Al menos una mayúscula', test: (val: string) => /[A-Z]/.test(val) },
  { id: 'lowercase', label: 'Al menos una minúscula', test: (val: string) => /[a-z]/.test(val) },
  { id: 'number', label: 'Al menos un número', test: (val: string) => /[0-9]/.test(val) },
  { id: 'special', label: 'Al menos un carácter especial', test: (val: string) => /[^A-Za-z0-9]/.test(val) },
];

export default function RegisterWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [mailValidationToken, setMailValidationToken] = useState<string | null>(null);
  const [phoneValidationToken, setPhoneValidationToken] = useState<string | null>(null);
  const { params, username, setAuthCode, getQueryString } = useAuth();
  const router = useRouter();

  const contactForm = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: username.includes('@') ? username : '',
      countryCode: '+56',
      phone: ''
    }
  });
  const emailOtpForm = useForm({
    resolver: zodResolver(emailOtpSchema),
    defaultValues: { otp: '' }
  });

  const phoneOtpForm = useForm({
    resolver: zodResolver(phoneOtpSchema),
    defaultValues: { otp: '' }
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phoneTimer > 0) {
      interval = setInterval(() => {
        setPhoneTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer]);
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      lastname: '',
      password: ''
    }
  });

  const handleContactSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await authApi.sendOtp({
        user_identifier: data.email,
        channel: 'email',
        purpose: 'registration'
      });
      setActiveStep(1);
      setTimer(60);
    } catch (err) {
      setError('Error al enviar el código OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await authApi.validateOtp({
        user_identifier: contactForm.getValues().email,
        otp_code: data.otp,
        purpose: 'registration'
      });
      setMailValidationToken(response.data.payload.action_token);

      // Enviar OTP al teléfono antes de pasar al siguiente paso
      await authApi.sendOtp({
        user_identifier: `${contactForm.getValues().countryCode}${contactForm.getValues().phone}`,
        channel: 'sms',
        purpose: 'registration'
      });

      setActiveStep(2);
      setPhoneTimer(60);
    } catch (err) {
      setError('El código ingresado no es válido. Intenta de nuevo o solicita uno nuevo');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await authApi.validateOtp({
        user_identifier: `${contactForm.getValues().countryCode}${contactForm.getValues().phone}`,
        otp_code: data.otp,
        purpose: 'registration'
      });
      setPhoneValidationToken(response.data.payload.action_token);
      setActiveStep(3);
    } catch (err) {
      setError('El código ingresado no es válido. Intenta de nuevo o solicita uno nuevo');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await authApi.sendOtp({
        user_identifier: contactForm.getValues().email,
        channel: 'email',
        purpose: 'registration'
      });
      setTimer(60);
      setSuccessMsg('Código reenviado con éxito al correo');
    } catch (err) {
      setError('Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (phoneTimer > 0) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await authApi.sendOtp({
        user_identifier: `${contactForm.getValues().countryCode}${contactForm.getValues().phone}`,
        channel: 'sms',
        purpose: 'registration'
      });
      setPhoneTimer(60);
      setSuccessMsg('Código reenviado con éxito al teléfono');
    } catch (err) {
      setError('Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register({
        mail_validation_token: mailValidationToken,
        phone_validation_token: phoneValidationToken,
        name: data.name,
        lastname: data.lastname,
        password: data.password,
        phone: `${contactForm.getValues().countryCode}${contactForm.getValues().phone}`,
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
      });
      setAuthCode(response.data.payload.auth_code);
      router.push(`/handshake${getQueryString()}`);
    } catch (err) {
      setError('Error al completar el registro');
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
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              Crea tu cuenta
            </Typography>
            <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 0 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {activeStep === 0 && (
            <form onSubmit={contactForm.handleSubmit(handleContactSubmit)}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                {...contactForm.register('email')}
                error={!!contactForm.formState.errors.email}
                helperText={contactForm.formState.errors.email?.message}
                sx={{ mb: 3 }}
                disabled
              />
              <Controller
                name="phone"
                control={contactForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Teléfono Móvil"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value.replace(/\D/g, '');
                      field.onChange(val);
                    }}
                    error={!!contactForm.formState.errors.phone}
                    helperText={contactForm.formState.errors.phone?.message}
                    sx={{ mb: 3 }}
                    autoFocus
                    slotProps={{
                      htmlInput: {
                        inputMode: 'numeric',
                        pattern: '[0-9]*'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Controller
                            name="countryCode"
                            control={contactForm.control}
                            render={({ field: countryField }) => (
                              <Select
                                {...countryField}
                                variant="standard"
                                disableUnderline
                                sx={{
                                  mr: 1,
                                  '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    paddingRight: '24px !important',
                                    fontSize: '0.9rem'
                                  },
                                }}
                              >
                                {countries.map((c) => (
                                  <MenuItem key={`${c.code}-${c.name}`} value={c.code}>
                                    <Box component="span" sx={{ mr: 1 }}>{c.flag}</Box> {c.code}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Siguiente'}
              </Button>
            </form>
          )}

          {activeStep === 1 && (
            <form onSubmit={emailOtpForm.handleSubmit(handleOtpSubmit)}>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                Hemos enviado un código de 6 dígitos a <strong style={{ color: '#007BFF' }}>{contactForm.getValues().email}</strong>. Ingrésalo a continuación.
              </Typography>
              {successMsg && <Alert severity="info" sx={{ mb: 3 }}>{successMsg}</Alert>}

              <Controller
                name="otp"
                control={emailOtpForm.control}
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
                        value={field.value?.[index] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !/^\d$/.test(val)) return;

                          const newOtp = (field.value || '').split('');
                          newOtp[index] = val;
                          const finalOtp = newOtp.join('');
                          field.onChange(finalOtp);

                          if (val && index < 5) {
                            const nextInput = document.getElementById(`otp-input-${index + 1}`);
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !field.value?.[index] && index > 0) {
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

              {emailOtpForm.formState.errors.otp && (
                <Typography color="error" variant="caption" display="block" sx={{ textAlign: 'center', mb: 2 }}>
                  {emailOtpForm.formState.errors.otp.message}
                </Typography>
              )}

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading || emailOtpForm.watch('otp')?.length !== 6}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ mb: 2 }}
              >
                Validar Código
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
          )}

          {activeStep === 2 && (
            <form onSubmit={phoneOtpForm.handleSubmit(handlePhoneOtpSubmit)}>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                Hemos enviado un código de 6 dígitos a <strong style={{ color: '#007BFF' }}>{contactForm.getValues().countryCode} {contactForm.getValues().phone}</strong>. Ingrésalo a continuación.
              </Typography>
              {successMsg && <Alert severity="info" sx={{ mb: 3 }}>{successMsg}</Alert>}

              <Controller
                name="otp"
                control={phoneOtpForm.control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <TextField
                        key={index}
                        id={`phone-otp-input-${index}`}
                        inputProps={{
                          maxLength: 1,
                          style: { textAlign: 'center', fontSize: '1.5rem', padding: '10px' }
                        }}
                        sx={{ width: '45px' }}
                        value={field.value?.[index] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !/^\d$/.test(val)) return;

                          const newOtp = (field.value || '').split('');
                          newOtp[index] = val;
                          const finalOtp = newOtp.join('');
                          field.onChange(finalOtp);

                          if (val && index < 5) {
                            const nextInput = document.getElementById(`phone-otp-input-${index + 1}`);
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !field.value?.[index] && index > 0) {
                            const prevInput = document.getElementById(`phone-otp-input-${index - 1}`);
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

              {phoneOtpForm.formState.errors.otp && (
                <Typography color="error" variant="caption" display="block" sx={{ textAlign: 'center', mb: 2 }}>
                  {phoneOtpForm.formState.errors.otp.message}
                </Typography>
              )}

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading || phoneOtpForm.watch('otp')?.length !== 6}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ mb: 2 }}
              >
                Validar Teléfono
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={handleResendPhoneOtp}
                disabled={phoneTimer > 0 || loading}
              >
                {phoneTimer > 0 ? `Reenviar código en ${phoneTimer}s` : 'Reenviar código'}
              </Button>
            </form>
          )}

          {activeStep === 3 && (
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    autoFocus
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
              <Controller
                name="password"
                control={profileForm.control}
                render={({ field }) => {
                  const passwordValue = field.value || '';
                  const metRequirements = passwordRequirements.filter(req => req.test(passwordValue));
                  const allMet = metRequirements.length === passwordRequirements.length;

                  return (
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        {...field}
                        fullWidth
                        type="password"
                        label="Contraseña"
                        error={!!profileForm.formState.errors.password}
                        helperText={profileForm.formState.errors.password?.message}
                      />
                      {!allMet && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          {passwordRequirements.map((req) => {
                            const isMet = req.test(passwordValue);
                            return (
                              <Box
                                key={req.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  mb: 0.5,
                                  color: isMet ? 'success.main' : 'text.secondary',
                                  transition: 'color 0.2s'
                                }}
                              >
                                <CheckCircle2 size={14} style={{ opacity: isMet ? 1 : 0.3 }} />
                                <Typography variant="caption">
                                  {req.label}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                }}
              />
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Finalizar Registro'}
              </Button>
            </form>
          )}

          <Button
              fullWidth
              startIcon={<ArrowLeft size={18} />}
              onClick={() => router.push(`/identifier${getQueryString()}`)}
              sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
