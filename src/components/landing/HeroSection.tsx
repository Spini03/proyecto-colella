'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const scrollToBooking = () => {
    const element = document.getElementById('booking')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 md:px-8 bg-gradient-to-b from-white via-[var(--color-brand-accent)]/30 to-white dark:from-neutral-950 dark:via-[var(--color-brand-dark)]/10 dark:to-neutral-900 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 h-48 w-48 overflow-hidden rounded-full border-4 border-[var(--color-brand-primary)] shadow-xl md:h-64 md:w-64"
      >
        <div className="absolute inset-0 bg-gray-200">
          <Image
            src="/assets/profile/iso_sobre_color.jpg"
            alt="Lic. Federico Colella"
            fill
            className="object-cover"
            priority
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center max-w-3xl"
      >
        <h1 className="mb-2 text-balance text-4xl font-bold tracking-tight text-[var(--color-primary)] md:text-6xl lg:text-7xl font-display">
          Lic. Federico Colella
        </h1>
        <p className="mb-6 text-xl font-semibold text-[var(--color-brand-primary)] md:text-2xl">
          Terapia Manual Fascial & Entrenamiento Físico Adaptado
        </p>
        
        <p className="mb-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Recuperación funcional mediante un método innovador que integra la <strong>Terapia Manual Fascial</strong> con el <strong>Entrenamiento Físico Adaptado</strong>, basado en evidencia científica de vanguardia y una intervención personalizada de alta precisión.
        </p>

        {/* Credentials / Trust Badges */}
        <div className="mb-10 flex flex-wrap justify-center gap-4 text-sm font-semibold text-[var(--color-brand-dark)]">
          {[
            "Co-fundador de Adapted Postural Training",
            "Director en GAP Salud",
            "Master Teacher en Pilates Terapéutico",
            "Especialista en Biomecánica"
          ].map((badge, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="rounded-full bg-[var(--color-brand-accent)] px-4 py-2 shadow-sm border border-[var(--color-brand-secondary)]/20"
            >
              {badge}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Button
          size="lg"
          onClick={scrollToBooking}
          className="h-14 px-10 text-lg font-bold shadow-lg transition-transform hover:scale-105 rounded-full"
        >
          AGENDÁ TU SESIÓN
        </Button>
      </motion.div>
    </section>
  )
}
