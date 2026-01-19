"use client"

import { motion } from "framer-motion"
import { 
  Activity, 
  Brain, 
  Users, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Languages,
  BookOpen,
  Building2
} from "lucide-react"

export function AboutSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900 dark:to-[#0a0a0a]">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Sobre Mí
          </h2>
          <div className="h-1.5 w-24 bg-[var(--color-brand-primary)] mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Soy <strong className="text-gray-900 dark:text-white">Federico Colella</strong>. Mi pasión es el movimiento humano y la recuperación funcional. 
            He desarrollado una metodología única que fusiona la <span className="text-[var(--color-brand-primary)] font-medium">terapia manual fascial</span> con el <span className="text-[var(--color-brand-primary)] font-medium">entrenamiento físico adaptado</span>.
          </p>
        </motion.div>

        {/* Philosophy Cards */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-24"
        >
          <Card 
            icon={<Brain className="w-8 h-8 text-[var(--color-brand-primary)]" />}
            title="Fundamento Científico"
            description="Basado en los últimos avances en fisiología y fisiopatología fascial. Cada decisión terapéutica responde a evidencia y necesidades únicas."
          />
          <Card 
            icon={<Activity className="w-8 h-8 text-[var(--color-brand-primary)]" />}
            title="Método Integrativo"
            description="Una sinergia entre terapia manual para restaurar tejidos y entrenamiento preciso para consolidar los cambios y potenciar la recuperación."
          />
          <Card 
            icon={<Users className="w-8 h-8 text-[var(--color-brand-primary)]" />}
            title="Enfoque Humano"
            description="Considero al paciente en todas sus dimensiones: biológica, funcional y adaptativa. No es solo un tratamiento, es una transformación."
          />
        </motion.div>

        <div className="grid lg:grid-cols-1 gap-16">
          
          {/* Experience Categorized */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-3 mb-10">
              <Briefcase className="w-8 h-8 text-[var(--color-brand-primary)]" />
              <h3 className="text-3xl font-bold font-display text-center">Trayectoria Profesional</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Column 1: Management & Clinical */}
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Gestión y Clínica</h4>
                    </div>
                    <div className="space-y-8">
                        <ExperienceItem 
                            role="Director del Depto. Internacional"
                            place="GAP Salud y Formación"
                            period="2022 - Actualidad"
                            description="Liderazgo en áreas de rehabilitación física y formación profesional."
                        />
                         <ExperienceItem 
                            role="Co-fundador"
                            place="Adapted Postural Training"
                            period="Emprendimiento"
                            description="Desarrollo de metodologías de entrenamiento postural adaptado."
                        />
                         <ExperienceItem 
                            role="Kinesiólogo y Entrenador"
                            place="Clínica GAP Salud"
                            period="2020 - Actualidad"
                            description="Atención clínica especializada en rehabilitación y entrenamiento."
                        />
                    </div>
                </div>

                {/* Column 2: Teaching & Research */}
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Docencia e Investigación</h4>
                    </div>
                    <div className="space-y-8">
                        <ExperienceItem 
                            role="Colaborador Docente"
                            place="Formación Int. en Pilates Terapéutico"
                            period="2022 - Actualidad"
                            description="Colaboración en cursos en inglés dictados por Gabriel Pidello."
                        />
                         <ExperienceItem 
                            role="Tutor de Pasantías"
                            place="GAP Salud y Formación"
                            period="2022 - Actualidad"
                            description="Supervisión de trabajos sobre control postural en acondicionamiento físico."
                        />
                         <ExperienceItem 
                            role="Traductor y Colaborador"
                            place="Universidad Abierta Interamericana"
                            period="2023"
                            description="Junto al Dr. Richard Souza (UCSF) en presentación sobre lesiones en carrera."
                        />
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Certifications & Badges */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="grid md:grid-cols-3 gap-6"
          >
             <div className="md:col-span-3 mb-4">
               <div className="flex items-center justify-center gap-3">
                  <Award className="w-6 h-6 text-[var(--color-brand-primary)]" />
                  <h3 className="text-2xl font-bold font-display text-center">Certificaciones</h3>
               </div>
             </div>

             <CertificationItem title="Master Teacher of Therapeutical Pilates" />
             <CertificationItem title="Formación en Normalización Biomecánica" />
             <CertificationItem title="Formación en Pilates Terapéutico" />

             <div className="md:col-span-3 grid md:grid-cols-2 gap-6 mt-4">
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 flex items-start gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Formación Continua</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Comprometido con la excelencia académica y la actualización constante en técnicas de rehabilitación.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 flex items-start gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                        <Languages className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Bilingüe</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Capacidad para dictar formaciones y atender pacientes en Español e Inglés con fluidez técnica.
                        </p>
                    </div>
                </div>
             </div>

          </motion.div>
        </div>

      </div>
    </section>
  )
}

function Card({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 }
      }}
      className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-neutral-700"
    >
      <div className="mb-6 bg-gray-50 dark:bg-neutral-700/50 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  )
}

function ExperienceItem({ role, place, period, description }: { role: string, place: string, period: string, description: string }) {
  return (
    <div className="relative pl-4 border-l-2 border-gray-100 dark:border-neutral-700">
      <div className="mb-1">
        <h5 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{role}</h5>
        <p className="text-sm font-medium text-[var(--color-brand-primary)]">{place}</p>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{period}</p>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function CertificationItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-5 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm transition-transform hover:-translate-y-1 duration-300">
      <div className="h-2 w-2 rounded-full bg-[var(--color-brand-primary)] flex-shrink-0" />
      <span className="font-medium text-gray-800 dark:text-gray-200 text-sm md:text-base">{title}</span>
    </div>
  )
}
