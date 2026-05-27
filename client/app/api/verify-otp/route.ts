import { NextRequest, NextResponse } from "next/server";
import { getOTP, deleteOTP } from "../utils/otpStore";

// Mock user database (in production, use real database)
const users = new Map([
 ["+919876543210", { id: "1", name: "John Doe", role: "admin" }],
 ["+918765432109", { id: "2", name: "Jane Smith", role: "manager" }],
 ["+917654321098", { id: "3", name: "Mike Johnson", role: "cashier" }],
]);

// Generate JWT token (in production, use proper JWT library)
function generateToken(userId: string): string {
 const payload = {
 userId,
 timestamp: Date.now(),
 expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
 };
 return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export async function POST(request: NextRequest) {
 try {
 const { phoneNumber, otp, rememberDevice = false } = await request.json();

 // Validate input
 if (!phoneNumber || !otp) {
 return NextResponse.json(
 { success: false, message: "Phone number and OTP are required" },
 { status: 400 },
 );
 }

 // Validate OTP format
 if (!/^\d{6}$/.test(otp)) {
 return NextResponse.json(
 { success: false, message: "OTP must be 6 digits" },
 { status: 400 },
 );
 }

 // Get stored OTP
 const storedData = getOTP(phoneNumber);

 if (!storedData) {
 return NextResponse.json(
 {
 success: false,
 message: "OTP not found or expired. Please request a new OTP.",
 },
 { status: 400 },
 );
 }

 // Check if OTP is expired
 if (Date.now() > storedData.expiresAt) {
 deleteOTP(phoneNumber);
 return NextResponse.json(
 {
 success: false,
 message: "OTP has expired. Please request a new OTP.",
 },
 { status: 400 },
 );
 }

 // Verify OTP
 if (storedData.otp !== otp) {
 return NextResponse.json(
 { success: false, message: "Invalid OTP. Please try again." },
 { status: 400 },
 );
 }

 // OTP is valid, remove it from storage
 deleteOTP(phoneNumber);

 // Get or create user
 let user = users.get(phoneNumber);
 if (!user) {
 // Create new user for first-time login
 const userId = `user_${Date.now()}`;
 user = {
 id: userId,
 name: `User ${phoneNumber.slice(-4)}`,
 role: "cashier", // default role
 };
 users.set(phoneNumber, user);
 }

 // Generate token
 const token = generateToken(user.id);

 // Prepare user data
 const userData = {
 id: user.id,
 name: user.name,
 phone: phoneNumber,
 role: user.role,
 loginMethod: "otp",
 rememberDevice,
 };

 console.log(`OTP verification successful for ${phoneNumber}`);

 return NextResponse.json({
 success: true,
 message: "OTP verified successfully",
 data: {
 token,
 user: userData,
 expiresIn: 86400, // 24 hours in seconds
 },
 });
 } catch (error) {
 console.error("Verify OTP Error:", error);
 return NextResponse.json(
 { success: false, message: "Internal server error" },
 { status: 500 },
 );
 }
}
