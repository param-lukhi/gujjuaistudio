// SMS Dispatch Utility for Worldwide / International & Indian Phone Numbers
// Supports: Twilio (Global / Worldwide 180+ countries), Fast2SMS, and 2Factor

export async function sendSmsOtp({
  phoneNumber,
  otp,
}: {
  phoneNumber: string;
  otp: string;
}): Promise<{ success: boolean; message?: string }> {
  const cleanInput = phoneNumber.trim();

  // Format international E.164 phone number for Twilio / global delivery
  let internationalPhone = cleanInput;
  if (!internationalPhone.startsWith('+')) {
    const rawDigits = internationalPhone.replace(/[^0-9]/g, '');
    if (rawDigits.length === 10) {
      internationalPhone = `+91${rawDigits}`; // Default to +91 if 10-digit number entered
    } else {
      internationalPhone = `+${rawDigits}`;
    }
  }

  // 1. Twilio Integration (Global / Worldwide SMS in 180+ Countries: USA, UK, UAE, Canada, Australia, India, etc.)
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const body = new URLSearchParams({
        To: internationalPhone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Your Gujju AI Studio verification code is: ${otp}. Valid for 10 minutes.`,
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
        message:
          errData.message ||
          'Failed to send SMS to this phone number via Twilio.',
      };
    } catch (error: any) {
      console.error('Twilio dispatch exception:', error);
      return {
        success: false,
        message: 'Twilio SMS service connection error.',
      };
    }
  }

  // 2. Fast2SMS Integration (For Indian numbers)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const rawDigits = cleanInput.replace(/[^0-9]/g, '');
      const tenDigit =
        rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;

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

  // 3. 2Factor.in Integration
  if (process.env.TWOFACTOR_API_KEY) {
    try {
      const rawDigits = cleanInput.replace(/[^0-9]/g, '');
      const tenDigit =
        rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;
      const apiKey = process.env.TWOFACTOR_API_KEY;
      const url = `https://2factor.in/API/V1/${apiKey}/SMS/${tenDigit}/${otp}/GujjuAI`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.Status === 'Success') {
        return { success: true };
      }
      return {
        success: false,
        message: data.Details || '2Factor failed to deliver OTP.',
      };
    } catch (error) {
      console.error('2Factor dispatch error:', error);
      return { success: false, message: '2Factor SMS service error.' };
    }
  }

  // If no SMS gateway is configured:
  console.warn(
    `[SMS NOTICE] No SMS Gateway API key (TWILIO_ACCOUNT_SID, FAST2SMS_API_KEY, or TWOFACTOR_API_KEY) found in environment variables.`
  );

  return {
    success: false,
    message:
      'Global SMS service is not yet configured. Please add Twilio credentials in your Vercel Environment Variables or verify using Email OTP.',
  };
}
