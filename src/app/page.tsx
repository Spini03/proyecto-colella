import { HeroSection } from "@/components/landing/HeroSection"
import { SuccessStories } from "@/components/landing/SuccessStories"
import { BookingWidget } from "@/components/booking/BookingWidget"
import { WhatsAppFloatingButton } from "@/components/ui/WhatsAppFloatingButton"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      
      <section id="methodology">
        <SuccessStories />
      </section>

      {/* Academy / Courses Placeholder */}
      <section id="about" className="py-24 bg-gray-50 dark:bg-neutral-900 border-y border-gray-100 dark:border-neutral-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-6 tracking-tight">Sobre Mí</h2>
            <div className="h-1.5 w-20 bg-[var(--color-brand-primary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-1 gap-12 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            <div className="space-y-6">
              <p>
                Soy <strong>Federico</strong>, un profesional apasionado por el movimiento humano y la recuperación funcional. Desde mi especialidad (la terapia manual fascial y el entrenamiento físico adaptado) desarrollé un método de rehabilitación innovador que combina ambas disciplinas en un orden específico y científicamente fundamentado, logrando una intervención altamente personalizada y efectiva.
              </p>
              <p>
                Mi enfoque se basa en los más recientes avances en fisiología y fisiopatología fascial, junto con las nuevas posibilidades que brinda la medición precisa de variables en el entrenamiento actual. Esta integración me permite diseñar tratamientos verdaderamente a medida, donde cada decisión terapéutica responde a las necesidades únicas de cada paciente.
              </p>
              <p>
                Aplico mi experiencia en terapia manual fascial, orientada a restaurar la funcionalidad del tejido y optimizar la respuesta del sistema miofascial, integrándola con el entrenamiento físico adaptado. Ajusto cargas, tiempos y estímulos con precisión para consolidar los cambios logrados en la terapia y potenciar la recuperación.
              </p>
              <p>
                Mi visión me permitió crear una metodología que considera al ser humano en todas sus dimensiones (biológica, funcional y adaptativa), entendiendo que la sinergia entre el trabajo manual y el entrenamiento consciente es clave para un resultado duradero y de calidad.
              </p>
              <p className="italic font-medium">
                Más que un tratamiento, ofrezco un proceso de transformación y recuperación integral, donde la ciencia y la personalización se encuentran para devolver al cuerpo su mejor versión.
              </p>
            </div>

            <div className="mt-12 bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700">
              <h3 className="text-2xl font-bold mb-6 font-display">Federico Colella</h3>
              <ul className="space-y-4 text-base">
                <li className="flex gap-3">
                  <span className="text-[var(--color-brand-primary)] font-bold">•</span>
                  Rehabilitación y entrenamiento en clínica GAP salud y formación. (2020-actualidad)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-brand-primary)] font-bold">•</span>
                  Colaborador en la formación internacional de rehabilitación en Pilates terapéutico en inglés de Gabriel Pidello. (2022-actualidad)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-brand-primary)] font-bold">•</span>
                  Director del departamento internacional de entrenamiento y rehabilitación de GAP salud y formación (español e inglés). (2022-actualidad)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-brand-primary)] font-bold">•</span>
                  Traductor y colaborador en la presentación en vivo del Dr. Richard Souza de la Universidad de California sobre «Impacto de las tasas de carga y lesiones por uso excesivo en la carrera» en la Universidad Abierta Interamericana Rosario. (2023)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-brand-primary)] font-bold">•</span>
                  Tutor del trabajo de control postural en acondicionamiento físico en pasantías nacionales e internacionales de GAP Salud y Formación. (2022-actualidad)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-brand-primary)] font-bold">•</span>
                  Co-fundador de Adapted Postural Training.
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-neutral-700">
                <h4 className="font-bold text-lg mb-3">Certificaciones y formación adicional:</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-700 rounded-full">Formación en normalización biomecánica del deportista</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-700 rounded-full">Formación en Pilates Terapéutico</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-700 rounded-full">Master teacher of Therapeutical Pilates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingWidget />

      <WhatsAppFloatingButton />
      
      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Lic. Federico Colella. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}
