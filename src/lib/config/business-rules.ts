export const BUSINESS_RULES = {
  CANCELLATION_MIN_HOURS: 24,
  REMINDER_WINDOWS_HOURS: [30, 4],
  DEPOSIT_REQUIRED: true,
  DEPOSIT_TYPE: 'PERCENTAGE', // 'PERCENTAGE' | 'FIXED'
  DEPOSIT_PERCENTAGE: 50,
  SERVICE_PRICE: 20000, // Create a Service model later for dynamic pricing
  BOOKING_WINDOW_DAYS: 30, // How far in advance to show availability
} as const;
