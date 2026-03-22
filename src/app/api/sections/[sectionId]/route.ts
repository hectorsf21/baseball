// src/app/api/sections/[sectionId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Dejamos la firma de la función simple, ya no dependemos de 'params'
export async function GET(request: Request) {
  try {
    // MÉTODO MANUAL A PRUEBA DE FALLOS
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/'); // -> ['', 'api', 'sections', '1']
    const sectionId = pathSegments[pathSegments.length - 1]; // -> '1'

    const idAsNumber = parseInt(sectionId, 10);
    if (isNaN(idAsNumber)) {
      return new NextResponse('Invalid section ID', { status: 400 });
    }

    const section = await prisma.section.findUnique({
      where: { 
        id: idAsNumber
      },
      include: { players: true },
    });
    
    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }
    
    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    return new NextResponse('Error fetching section', { status: 500 });
  }
}

// PUT -> Actualizar el nombre de una sección específica
export async function PUT(request: Request) {
    try {
        // Usamos el método manual que ya te funciona bien
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const sectionId = pathSegments[pathSegments.length - 1];

        const idAsNumber = parseInt(sectionId, 10);
        if (isNaN(idAsNumber)) {
            return new NextResponse('Invalid section ID', { status: 400 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return new NextResponse('Name is required and must be a non-empty string', { status: 400 });
        }

        const updatedSection = await prisma.section.update({
            where: { id: idAsNumber },
            data: { name: name.trim() },
        });

        return NextResponse.json(updatedSection);
    } catch (error) {
        console.error('Error updating section:', error);
        return new NextResponse('Error updating section', { status: 500 });
    }
}
// DELETE -> Eliminar una sección específica
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const sectionId = pathSegments[pathSegments.length - 1];

        const idAsNumber = parseInt(sectionId, 10);
        if (isNaN(idAsNumber)) {
            return new NextResponse('Invalid section ID', { status: 400 });
        }
        
        await prisma.section.delete({
            where: { id: idAsNumber },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting section:', error);
        return new NextResponse('Error deleting section', { status: 500 });
    }
}