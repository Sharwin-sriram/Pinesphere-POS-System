import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: "Pinesphere POS",
  description: "Restaurant Management System",
};

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


    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}