export const BUSINESS_RULES = {
  CANCELLATION_MIN_HOURS: 24,
  REMINDER_WINDOWS_HOURS: [30, 4],
  DEPOSIT_REQUIRED: true,
  BOOKING_WINDOW_DAYS: 30, // How far in advance to show availability
} as const;
