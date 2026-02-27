import { Suspense } from 'react'
import Link from 'next/link'
import { HeroSection } from "@/components/landing/HeroSection"
import { SuccessStories } from "@/components/landing/SuccessStories"
import { BookingWidget } from "@/components/booking/BookingWidget"
import { WhatsAppFloatingButton } from "@/components/ui/WhatsAppFloatingButton"
import { AboutSection } from "@/components/landing/AboutSection"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      
      <section id="methodology">
        <SuccessStories />
      </section>
      <AboutSection />
      <Suspense fallback={<div className="py-24 text-center">Cargando reserva...</div>}>
        <BookingWidget />
      </Suspense>
      <WhatsAppFloatingButton />
      
      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 space-y-3">
        <p>© {new Date().getFullYear()} Lic. Federico Colella. Todos los derechos reservados.</p>
        <div className="flex justify-center gap-6">
          <Link href="/privacidad" className="hover:text-teal-400 transition-colors">Política de Privacidad</Link>
          <Link href="/terminos" className="hover:text-teal-400 transition-colors">Términos y Condiciones</Link>
        </div>
      </footer>
    </main>
  )
}
