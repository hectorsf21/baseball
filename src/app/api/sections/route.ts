// app/api/sections/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET -> Obtener todas las secciones
export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      include: {
        _count: { // Incluimos un conteo de jugadores por sección
          select: { players: true },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(sections);
  } catch (error) {
    return new NextResponse('Error fetching sections', { status: 500 });
  }
}

// POST -> Crear una nueva sección
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const newSection = await prisma.section.create({
      data: { name },
    });
    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    return new NextResponse('Error creating section', { status: 500 });
  }
}

