'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getPublicSuccessStories } from '@/app/public-stories'

type Story = {
    id: string
    name: string
    role: string
    description: string | null
    imageUrl: string | null
}

export function SuccessStories() {
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    getPublicSuccessStories().then(setStories)
  }, [])

  if (stories.length === 0) return null

  return (
    <section className="bg-white py-20 dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold font-display">
          Casos de Éxito
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3">
          {stories.map((athlete, index) => (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-[2rem] bg-gray-100 shadow-md aspect-[4/5]"
            >
              <div className="absolute inset-0 grayscale transition-all duration-700 group-hover:grayscale-0">
                 <div className="h-full w-full bg-gray-300 relative"> 
                    {athlete.imageUrl ? (
                        <img
                            src={athlete.imageUrl}
                            alt={athlete.name}
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Sin Imagen</div>
                    )}
                 </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-500" />

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                <h3 className="text-2xl font-bold mb-1">{athlete.name}</h3>
                <p className="text-teal-400 font-bold uppercase tracking-wider text-xs mb-3">{athlete.role}</p>
                {athlete.description && (
                    <p className="text-gray-200 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">
                        {athlete.description}
                    </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
