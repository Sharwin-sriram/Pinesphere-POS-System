// In-memory OTP storage (in production, use Redis or database)
interface OTPData {
 otp: string;
 expiresAt: number;
 attempts: number;
}

const otpStorage = new Map<string, OTPData>();

// Clean expired OTPs
function cleanExpiredOTPs() {
 const now = Date.now();
 for (const [phone, data] of otpStorage.entries()) {
 if (data.expiresAt < now) {
 otpStorage.delete(phone);
 }
 }
}

// Set OTP
export function setOTP(phoneNumber: string, otp: string, expiresAt: number, attempts: number = 1) {
 cleanExpiredOTPs();
 otpStorage.set(phoneNumber, { otp, expiresAt, attempts });
}

// Get OTP
export function getOTP(phoneNumber: string): OTPData | undefined {
 cleanExpiredOTPs();
 return otpStorage.get(phoneNumber);
}

// Delete OTP
export function deleteOTP(phoneNumber: string) {
 otpStorage.delete(phoneNumber);
}

// Get all OTPs (for debugging)
export function getAllOTPs() {
 cleanExpiredOTPs();
 return Array.from(otpStorage.entries());
}