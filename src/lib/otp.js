export function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // 0–9
  }
  return otp;
}

export function getOTPExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}