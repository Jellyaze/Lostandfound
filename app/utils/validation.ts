export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9-+()]*$/;
  return phoneRegex.test(phone) && phone.replace(/[^0-9]/g, '').length >= 10;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};