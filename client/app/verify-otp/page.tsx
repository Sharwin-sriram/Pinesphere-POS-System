"use client";

import React, { Suspense } from "react";
import VerifyOTP from "../components/VerifyOTP";

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div />}>
      <VerifyOTP />
    </Suspense>
  );
}
