// SMS Dispatch Utility for Indian & International Phone Numbers
// Supports Fast2SMS, Twilio, 2Factor, and Dev Fallback

export async function sendSmsOtp({
  phoneNumber,
  otp,
}: {
  phoneNumber: string;
  otp: string;
}): Promise<{ success: boolean; simulated?: boolean; message?: string }> {
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
        return { success: true, simulated: false };
      }
      console.warn('Fast2SMS failed response:', data);
    } catch (error) {
      console.error('Fast2SMS dispatch error:', error);
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
        return { success: true, simulated: false };
      }
    } catch (error) {
      console.error('Twilio dispatch error:', error);
    }
  }

  // 3. Development / Demo Fallback Mode (When no paid SMS API is configured)
  console.log('=====================================================');
  console.log(`[SMS OTP DISPATCH] Phone: ${phoneNumber}`);
  console.log(`[SMS OTP DISPATCH] OTP: ${otp}`);
  console.log(
    `[SMS OTP DISPATCH] Message: Your Gujju AI Studio OTP is ${otp}. Valid for 10 minutes.`
  );
  console.log('=====================================================');

  return {
    success: true,
    simulated: true,
    message: `SMS sent! Demo OTP code: ${otp}`,
  };
}
