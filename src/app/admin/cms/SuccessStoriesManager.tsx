'use client'

import { useState } from 'react'
import { upsertSuccessStory, deleteSuccessStory } from '../actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Story {
  id: string
  name: string
  role: string
  imageUrl: string | null
  isActive: boolean
}

export function SuccessStoriesManager({ initialStories }: { initialStories: Story[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  
  // Temporary state for form
  const [formData, setFormData] = useState<Partial<Story>>({})

  const handleEdit = (story: Story) => {
    setEditingId(story.id)
    setFormData(story)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setFormData({ isActive: true, imageUrl: '' })
    setIsCreating(true)
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este caso de éxito?')) {
      await deleteSuccessStory(id)
      router.refresh()
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.role) return alert('Nombre y Rol son obligatorios')
    
    await upsertSuccessStory({
        id: editingId || undefined,
        name: formData.name,
        role: formData.role,
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive || false
    })
    
    setEditingId(null)
    setIsCreating(false)
    setFormData({})
    router.refresh()
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({})
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Create New Stuff */}
      {!isCreating && (
        <button 
            onClick={handleCreate}
            className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors group"
        >
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl text-gray-500 font-bold">+</span>
            </div>
            <p className="font-medium text-gray-500">Agregar Nuevo Caso</p>
        </button>
      )}

      {/* Form Card (Create or Edit) */}
      {(isCreating || editingId) && (
         <div className="col-span-1 md:col-span-1 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border-2 border-[var(--color-brand-primary)] p-6 z-10">
            <h3 className="font-bold text-lg mb-4">{isCreating ? 'Nuevo Caso' : 'Editar Caso'}</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ej: Lionel Messi"
                    />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Rol / Descripción</label>
                   <input 
                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                       value={formData.role || ''}
                       onChange={e => setFormData({...formData, role: e.target.value})}
                       placeholder="Ej: Futbolista Profesional"
                   />
               </div>
               <div>
                   <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                   <input 
                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                       value={formData.imageUrl || ''}
                       onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                       placeholder="https://..."
                   />
               </div>
               <div className="flex items-center gap-2">
                   <input 
                        type="checkbox"
                        checked={formData.isActive || false}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300"
                   />
                   <label className="text-sm">Mostrar públicamente</label>
               </div>
               <div className="flex gap-2 pt-2">
                   <Button onClick={handleSave} className="flex-1">Guardar</Button>
                   <Button variant="outline" onClick={handleCancel} className="flex-1">Cancelar</Button>
               </div>
            </div>
         </div>
      )}

      {/* Existing Items */}
      {initialStories.map(story => {
        if (story.id === editingId) return null // Hide if editing (shown in form)
        return (
            <div key={story.id} className={`group relative bg-white dark:bg-neutral-800 rounded-xl shadow-sm border dark:border-neutral-700 overflow-hidden flex flex-col ${!story.isActive ? 'opacity-60 grayscale' : ''}`}>
                <div className="aspect-[4/3] bg-gray-200 dark:bg-neutral-700 relative">
                    {story.imageUrl ? (
                        <img src={story.imageUrl} alt={story.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin imagen</div>
                    )}
                    {!story.isActive && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Oculto</div>
                    )}
                </div>
                <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg">{story.name}</h3>
                    <p className="text-sm text-gray-500">{story.role}</p>
                </div>
                <div className="p-4 pt-0 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(story)}>Editar</Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(story.id)}>Borrar</Button>
                </div>
            </div>
        )
      })}
    </div>
  )
}
