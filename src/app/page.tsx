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

      <BookingWidget />

      <WhatsAppFloatingButton />
      
      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Lic. Federico Colella. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}
