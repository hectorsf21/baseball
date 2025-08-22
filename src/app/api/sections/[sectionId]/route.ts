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