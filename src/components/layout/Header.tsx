'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  
  // Alternative to state if we want purely motion-based opacity
  // const opacity = useTransform(scrollY, [0, 50], [0, 1])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300 px-4 md:px-8 py-3',
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm dark:bg-[var(--color-brand-dark)]/80' 
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-md transition-transform group-hover:scale-105">
            <Image
              src="/assets/logo/iso_sobre_color.jpg"
              alt="Logo Federico Colella"
              fill
              className="object-cover"
            />
          </div>
          <span className={cn(
            "text-xl font-bold tracking-tight font-display transition-colors",
            "text-[var(--color-primary)]"
          )}>
            Federico Colella
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <button 
            onClick={() => scrollToSection('methodology')}
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            La Metodología
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            Sobre Mí
          </button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => scrollToSection('booking')}
            className="font-bold"
          >
            Reservar
          </Button>
        </nav>

        {/* Mobile menu could be added here later */}
        <div className="md:hidden">
          <Button 
            variant="default" 
            size="sm"
            onClick={() => scrollToSection('booking')}
          >
            Reservar
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
