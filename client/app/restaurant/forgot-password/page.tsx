"use client";

import React from "react";
import AuthCard from "../../components/AuthCard";

const RestaurantForgotPasswordPage = () => {
  return (
    <AuthCard title="Restaurant password reset" subtitle="This page is not yet available. Please contact support or use the main forgot password flow.">
      <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
        Forgot password for restaurant accounts will be available soon. In the meantime, use the standard forgot password flow or contact{" "}
        <a
          href="mailto:support@pinesphere.com"
          className="font-medium text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]"
        >
          support@pinesphere.com
        </a>
        .
      </p>
    </AuthCard>
  );
};

export default RestaurantForgotPasswordPage;

