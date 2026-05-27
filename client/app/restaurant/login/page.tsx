"use client";

import React, { Suspense } from "react";
import RestaurantLoginForm from "../components/RestaurantLoginForm";

export const dynamic = "force-dynamic";

const RestaurantLoginPage = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <RestaurantLoginForm />
    </Suspense>
  );
};

export default RestaurantLoginPage;

