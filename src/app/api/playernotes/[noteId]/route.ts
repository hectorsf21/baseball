// app/api/playernotes/[noteId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Manteniendo tu ruta original

// Ya no necesitamos la interfaz 'Params'

// PUT -> Actualizar las notas de un jugador
export async function PUT(request: Request) {
    try {
        // MÉTODO MANUAL A PRUEBA DE FALLOS
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const noteId = pathSegments[pathSegments.length - 1];
        
        const idAsNumber = parseInt(noteId, 10);
        if (isNaN(idAsNumber)) {
            return new NextResponse('Invalid note ID', { status: 400 });
        }

        const body = await request.json();
        const { notes } = body;

        const updatedNote = await prisma.playerNote.update({
            where: { id: idAsNumber }, // Usamos el ID extraído manualmente
            data: { notes },
        });

        return NextResponse.json(updatedNote);
    } catch (error) {
        console.error('Error updating notes:', error);
        return new NextResponse('Error updating notes', { status: 500 });
    }
}

// DELETE -> Quitar un jugador de una sección
export async function DELETE(request: Request) {
    try {
        // MÉTODO MANUAL A PRUEBA DE FALLOS
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const noteId = pathSegments[pathSegments.length - 1];

        const idAsNumber = parseInt(noteId, 10);
        if (isNaN(idAsNumber)) {
            return new NextResponse('Invalid note ID', { status: 400 });
        }

        await prisma.playerNote.delete({
            where: { id: idAsNumber }, // Usamos el ID extraído manualmente
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error removing player:', error);
        return new NextResponse('Error removing player', { status: 500 });
    }
}