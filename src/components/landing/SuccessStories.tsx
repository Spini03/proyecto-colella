'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const ATHLETES = [
  {
    name: "Lionel Messi",
    role: "Fútbol Profesional",
    image: "/assets/profile/placeholder.jpg", // Placeholder
  },
  {
    name: "Emiliano Boffelli",
    role: "Rugby Internacional",
    image: "/assets/profile/placeholder.jpg", // Placeholder
  },
  {
    name: "Ex-Jugadores Profesionales",
    role: "Trayectoria",
    image: "/assets/profile/placeholder.jpg", // Placeholder
  },
]

export function SuccessStories() {
  return (
    <section className="bg-white py-20 dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold font-display">
          Casos de Éxito
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3">
          {ATHLETES.map((athlete, index) => (
            <motion.div
              key={athlete.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl bg-gray-100 shadow-md"
            >
              <div className="aspect-[3/4] overflow-hidden grayscale transition-all duration-300 group-hover:grayscale-0">
                 <div className="h-full w-full bg-gray-300 relative"> 
                    {/* Placeholder div, replace with actual Image when assets exist */}
                    <Image
                        src={athlete.image}
                        alt={athlete.name}
                        fill
                        className="object-cover"
                    />
                 </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="text-xl font-bold">{athlete.name}</h3>
                <p className="text-sm font-medium opacity-90">{athlete.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
