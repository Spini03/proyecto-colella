Solución de duplicados mediante actualización atómica.
Se usa prisma.appointment.updateMany con status: 'Pending' para asegurar ejecución única.
El segundo request recibirá count: 0 y abortará.
