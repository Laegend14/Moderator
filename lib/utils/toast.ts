import { toast as sonnerToast, ExternalToast } from "sonner";

/**
 * Custom toast utilities for the GenLayer Moderation Platform.
 * Uses oklch colors for consistency with our brand-card and btn-primary styles.
 */

// Default configuration: Navy background with subtle borders
const defaultOptions: ExternalToast = {
  duration: 4000,
  closeButton: true,
  style: {
    background: 'oklch(0.25 0.08 265)', // --card color
    border: '1px solid oklch(0.30 0.10 265 / 0.4)',
    color: 'oklch(0.98 0 0)',
  },
};

// Success: Used for verdicts, filed reports, and reputation gains (Purple/Accent)
export const success = (message: string, options?: ExternalToast) => {
  return sonnerToast.success(message, {
    ...defaultOptions,
    style: {
      ...defaultOptions.style,
      border: '1px solid oklch(0.65 0.22 300 / 0.4)', // --primary
      color: 'oklch(0.65 0.22 300)',
      ...options?.style,
    },
    ...options,
  });
};

// Error: Used for failed transactions or rule violations (Red/Destructive)
export const error = (message: string, options?: ExternalToast) => {
  return sonnerToast.error(message, {
    ...defaultOptions,
    duration: 7000, // Verdict errors need more time to be read
    style: {
      ...defaultOptions.style,
      border: '1px solid oklch(0.65 0.25 25 / 0.5)', // --destructive
      color: 'oklch(0.65 0.25 25)',
      ...options?.style,
    },
    ...options,
  });
};

// Warning: Used for network mismatches (Yellow)
export const warning = (message: string, options?: ExternalToast) => {
  return sonnerToast.warning(message, {
    ...defaultOptions,
    duration: 5000,
    style: {
      ...defaultOptions.style,
      border: '1px solid oklch(0.75 0.15 80 / 0.4)',
      color: 'oklch(0.75 0.15 80)',
      ...options?.style,
    },
    ...options,
  });
};

// Loading: Used while the Intelligent Oracle is reaching consensus
export const loading = (message: string, options?: ExternalToast) => {
  return sonnerToast.loading(message, {
    ...defaultOptions,
    duration: Infinity, 
    ...options,
  });
};

// Config Error: For missing .env contract addresses
export const configError = (message: string, description?: string, action?: { label: string; onClick: () => void }) => {
  return sonnerToast.error(message, {
    description,
    duration: Infinity,
    closeButton: true,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    style: {
      ...defaultOptions.style,
      border: '1px solid oklch(0.65 0.25 25 / 0.5)',
      color: 'oklch(0.65 0.25 25)',
    },
  });
};

// User Rejected: Brief info toast for cancelled MetaMask prompts
export const userRejected = (message: string) => {
  return sonnerToast.info(message, {
    duration: 2500,
    closeButton: false,
    style: {
      ...defaultOptions.style,
      color: 'oklch(0.55 0 0)', // --muted-foreground
    },
  });
};

export { sonnerToast as toast };

export default {
  success,
  error,
  warning,
  loading,
  configError,
  userRejected,
  toast: sonnerToast,
};