import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers/Providers";
import ParticleBackground from "@/components/ui/ParticleBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Lic. Federico Colella | Kinesiología Deportiva",
  description: "Kinesiología Deportiva de Alto Rendimiento. Recuperación de lesiones y optimización del movimiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased`}
      >
        <ParticleBackground />
        <Providers>
            <Header />
            {children}
        </Providers>
      </body>
    </html>
  );
}
