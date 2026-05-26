import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { setOTP, getOTP } from "../utils/otpStore";

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if valid credentials are provided
let client: any = null;
if (accountSid && accountSid.startsWith('AC') && authToken && twilioPhoneNumber && twilioPhoneNumber.startsWith('+')) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
    client = null;
  }
}

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, countryCode = "+91" } = await request.json();

    // Validate input
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (10 digits for Indian numbers)
    if (!/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }

    // Check rate limiting (max 3 attempts per phone number per hour)
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const existingOTP = getOTP(fullPhoneNumber);
    
    if (existingOTP && existingOTP.attempts >= 3) {
      return NextResponse.json(
        { success: false, message: "Too many OTP requests. Please try again after 1 hour." },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 1 * 60 * 1000; // 1 minute
    const attempts = existingOTP ? existingOTP.attempts + 1 : 1;

    // Store OTP
    setOTP(fullPhoneNumber, otp, expiresAt, attempts);

    // If Twilio is not configured, use demo mode
    if (!client) {
      console.log(`Demo Mode: OTP for ${fullPhoneNumber} is: ${otp}`);
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully (Demo Mode - Check console)",
        data: {
          phoneNumber: fullPhoneNumber,
          expiresIn: 60, // 1 minute in seconds
          demoOtp: otp, // Only in demo mode for testing
        },
      });
    }

    // Send SMS via Twilio
    try {
      const message = await client.messages.create({
        body: `Your PineSphere POS login OTP is: ${otp}. Valid for 1 minute. Do not share this code with anyone.`,
        from: twilioPhoneNumber,
        to: fullPhoneNumber,
      });

      console.log(`OTP sent successfully to ${fullPhoneNumber}. Message SID: ${message.sid}`);

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        data: {
          phoneNumber: fullPhoneNumber,
          expiresIn: 60, // 1 minute in seconds
        },
      });

    } catch (twilioError: any) {
      console.error("Twilio SMS Error:", twilioError);
      
      // Handle specific Twilio errors
      if (twilioError.code === 21211) {
        return NextResponse.json(
          { success: false, message: "Invalid phone number format" },
          { status: 400 }
        );
      } else if (twilioError.code === 21614) {
        return NextResponse.json(
          { success: false, message: "Phone number is not valid for SMS" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: "Failed to send SMS. Please try again." },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}