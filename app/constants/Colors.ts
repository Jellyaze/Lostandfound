export const colors = {
  primary: "#6FAF9C",
  primarySoft: "#E6F3EF",
  primaryDark: "#3E7F6F",

  background: "#FFFFFF",
  surface: "#F7F9F8",
  border: "#D9E5E1",

  textPrimary: "#1F2933",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  accent: "#5FA8D3",
  danger: "#E05A5A",
  success: "#4CAF8C",
};

// Legacy support - keeping old Colors export for gradual migration
export const Colors = {
  primary: colors.primary,
  primaryLight: colors.primarySoft,
  primaryDark: colors.primaryDark,
  background: colors.background,
  white: colors.background,
  black: colors.textPrimary,
  gray: colors.textSecondary,
  lightGray: colors.surface,
  error: colors.danger,
  success: colors.success,
  warning: "#FF9500",
  text: {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    light: "#FFFFFF",
  },
  border: colors.border,
};