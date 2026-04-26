export async function sendOTPEmail(to , otp) {
    console.log(`Sending OTP ${otp} to ${to}`);
    // Here you would integrate with an email service like SendGrid, SES, etc.
    // For this example, we'll just log the OTP to the console.
}