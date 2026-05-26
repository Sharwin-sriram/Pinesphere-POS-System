"use client";

import "./globals.css";

import Sidebar from "./components/Sidebar";

import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [theme, setTheme] = useState("light");


  useEffect(() => {

    const savedTheme =
      localStorage.getItem("theme") || "light";

    setTheme(savedTheme);

  }, []);


  return (
    <html lang="en">

      <body
        style={{
          backgroundColor:
            theme === "dark"
              ? "#111827"
              : "#f3f4f6",

          color:
            theme === "dark"
              ? "white"
              : "#111827",
        }}
      >

        <div className="flex min-h-screen">

          {/* SIDEBAR */}

          <Sidebar />


          {/* PAGE */}

          <main
            style={{
              flex: 1,

              backgroundColor:
                theme === "dark"
                  ? "#111827"
                  : "#f3f4f6",

              color:
                theme === "dark"
                  ? "white"
                  : "#111827",
            }}
          >

            {children}

          </main>

        </div>

      </body>

    </html>
  );
}