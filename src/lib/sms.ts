// SMS Dispatch Utility for Indian & International Phone Numbers
// Supports Fast2SMS (Indian SMS Gateway) & Twilio (Global SMS Gateway)

export async function sendSmsOtp({
  phoneNumber,
  otp,
}: {
  phoneNumber: string;
  otp: string;
}): Promise<{ success: boolean; message?: string }> {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  // Extract 10-digit Indian phone number if prefixed with 91 or 0
  const tenDigit =
    cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

  // 1. Fast2SMS Integration (if FAST2SMS_API_KEY is configured in .env)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: tenDigit,
        }),
      });
      const data = await response.json();
      if (data.return) {
        return { success: true };
      }
      console.error('Fast2SMS failed response:', data);
      return {
        success: false,
        message: data.message?.[0] || 'Fast2SMS failed to deliver SMS.',
      };
    } catch (error: any) {
      console.error('Fast2SMS dispatch error:', error);
      return { success: false, message: 'SMS gateway connection error.' };
    }
  }

  // 2. Twilio Integration (if TWILIO credentials configured in .env)
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    try {
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${tenDigit}`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const body = new URLSearchParams({
        To: formattedPhone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Your Gujju AI Studio verification OTP is ${otp}. Valid for 10 minutes.`,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (response.ok) {
        return { success: true };
      }
      const errData = await response.json();
      console.error('Twilio dispatch error response:', errData);
      return {
        success: false,
        message: errData.message || 'Twilio failed to send SMS.',
      };
    } catch (error) {
      console.error('Twilio dispatch error:', error);
      return { success: false, message: 'Twilio SMS service error.' };
    }
  }

  // If no SMS gateway is configured in environment variables:
  console.warn(
    `[SMS NOTICE] SMS Gateway API key (FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID) is not configured in .env. SMS cannot be sent to ${phoneNumber}.`
  );

  return {
    success: false,
    message:
      'SMS Gateway is not yet configured. Please verify using Email OTP or add FAST2SMS_API_KEY / Twilio credentials in your Vercel Environment Variables.',
  };
}
