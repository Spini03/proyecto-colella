export default function AdminPage() {
  // TODO: Add proper authentication check
  // if (!session) redirect('/login')

  return (
    <main className="p-8 container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Próximos Turnos</h2>
           <p className="text-gray-500">No hay turnos pendientes.</p>
           {/* List bookings from DB */}
        </div>
        
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Gestionar Disponibilidad</h2>
          <p className="text-gray-500 mb-4">Bloquear fechas por vacaciones o ausencia.</p>
          {/* Add BlockoutDate Form */}
          <button className="px-4 py-2 bg-red-600 text-white rounded">Bloquear Fecha</button>
        </div>
      </div>
    </main>
  )
}
