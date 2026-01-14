import api from './axios';

export const authApi = {
  authorize: (redirectUri: string) => 
    api.get(`/auth/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`),

  checkIdentifier: (username: string) => 
    api.post('/auth/check-identifier', { username }),

  login: (data: any) => 
    api.post('/auth/login', data),

  sendOtp: (data: { user_identifier: string; channel: string; purpose: string; metadata?: any }) => 
    api.post('/auth/send-otp', data),

  validateOtp: (data: { user_identifier: string; otp_code: string; purpose: string }) => 
    api.post('/auth/validate-otp', data),

  register: (data: any) => 
    api.post('/auth/register', data),

  token: (data: { auth_code: string; code_verifier: string; device_info: any }) => 
    api.post('/auth/token', data),

  forgotPassword: (username: string) => 
    api.post('/auth/forgot-password', { username }),

  resetPassword: (data: any) => 
    api.post('/auth/reset-password', data),
};
