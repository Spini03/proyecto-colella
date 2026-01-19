'use server'

import { prisma } from '@/lib/prisma'
// Refreshing Prisma instance
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- Middleware / Auth Check ---
async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return session.user
}

// --- Appointments ---
export async function getAppointments(startDate?: string, endDate?: string) {
  await requireAdmin()
  
  const where: any = {}
  if (startDate) {
    where.datetime = {
      gte: new Date(startDate),
    }
  }
  if (endDate) {
    where.datetime = {
      ...where.datetime,
      lte: new Date(endDate),
    }
  }
  // If no date range, default to >= today - 1 day ??
  // Let's just default to "future" if nothing specified
  if (!startDate && !endDate) {
      where.datetime = {
          gte: new Date()
      }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
    },
    orderBy: {
      datetime: 'asc',
    },
  })
  
  // Serialize dates
  return appointments.map(app => ({
    ...app,
    datetime: app.datetime.toISOString(),
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  }))
}

// --- CMS: Success Stories ---
export async function getSuccessStories() {
    // Public read is fine, but this is admin action file. 
    // We'll use this for admin list which needs to see inactive ones too?
    await requireAdmin()
    return await prisma.successStory.findMany({
        orderBy: { order: 'asc' }
    })
}

export async function upsertSuccessStory(data: { id?: string, name: string, role: string, description?: string, imageUrl?: string, isActive: boolean }) {
    await requireAdmin()
    
    if (data.id) {
        await prisma.successStory.update({
            where: { id: data.id },
            data: {
                name: data.name,
                role: data.role,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive
            }
        })
    } else {
        await prisma.successStory.create({
            data: {
                name: data.name,
                role: data.role,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive
            }
        })
    }
    revalidatePath('/admin/cms')
    revalidatePath('/') // Landing page
}

export async function deleteSuccessStory(id: string) {
    await requireAdmin()
    await prisma.successStory.delete({ where: { id } })
    revalidatePath('/admin/cms')
    revalidatePath('/')
}

// --- Settings ---
export async function getGlobalSettings() {
    await requireAdmin()
    let settings = await prisma.globalSettings.findUnique({
        where: { id: 'settings' }
    })
    
    if (!settings) {
        // Create default
        settings = await prisma.globalSettings.create({
            data: {
                id: 'settings',
                currentPrice: 40000,
                sessionDuration: 30,
                depositPercentage: 50
            }
        })
    }
    return settings
}

export async function updateGlobalSettings(data: { currentPrice: number, sessionDuration: number }) {
    const user = await requireAdmin()
    
    const settings = await getGlobalSettings()
    
    // Log price change if different
    if (Number(settings.currentPrice) !== data.currentPrice) {
        await prisma.priceLog.create({
            data: {
                price: data.currentPrice,
                adminId: user.id!
            }
        })
    }
    
    await prisma.globalSettings.update({
        where: { id: 'settings' },
        data: {
            currentPrice: data.currentPrice,
            sessionDuration: data.sessionDuration
        }
    })
    
    revalidatePath('/admin/settings')
    revalidatePath('/booking') // Price affects booking
}

export async function getWorkSchedule() {
    await requireAdmin()
    return await prisma.workSchedule.findMany({
        orderBy: { dayOfWeek: 'asc' }
    })
}

export async function updateWorkSchedule(schedule: { dayOfWeek: number, startTime: string, endTime: string, isActive: boolean }[]) {
     await requireAdmin()
     
     // Upsert all
     for (const day of schedule) {
         await prisma.workSchedule.upsert({
             where: { dayOfWeek: day.dayOfWeek },
             update: {
                 startTime: day.startTime,
                 endTime: day.endTime,
                 isActive: day.isActive
             },
             create: {
                 dayOfWeek: day.dayOfWeek,
                 startTime: day.startTime,
                 endTime: day.endTime,
                 isActive: day.isActive
             }
         })
     }
     
     revalidatePath('/admin/settings')
}

// --- Availability Overrides ---
export async function addAvailabilityOverride(data: { date: Date, startTime: string, endTime: string }) {
    await requireAdmin()
    await prisma.availabilityOverride.create({
        data: {
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime
        }
    })
    revalidatePath('/admin/settings')
}

export async function getAvailabilityOverrides() {
    await requireAdmin()
    const today = new Date()
    today.setHours(0,0,0,0)
    return await prisma.availabilityOverride.findMany({
        where: { date: { gte: today } },
        orderBy: { date: 'asc' }
    })
}

export async function deleteAvailabilityOverride(id: string) {
    await requireAdmin()
    await prisma.availabilityOverride.delete({ where: { id } })
    revalidatePath('/admin/settings')
}
