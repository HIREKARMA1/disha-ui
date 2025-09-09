/**
 * Application configuration loaded from environment variables
 */
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    fullUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/${process.env.NEXT_PUBLIC_API_VERSION || 'v1'}`,
  },
  
  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'HireKarma',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debugMode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'production',
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Using default values. Check your .env.local file.');
  }
  
  return missingVars.length === 0;
}

// Validate environment on import
if (typeof window !== 'undefined') {
  validateEnvironment();
}
