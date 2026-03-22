// src/app/api/sections/[sectionId]/players/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Player } from '@/types';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // MÉTODO MANUAL A PRUEBA DE FALLOS
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/'); // -> ['', 'api', 'sections', '1', 'players']
    const sectionId = pathSegments[pathSegments.length - 2]; // -> '1'

    const idAsNumber = parseInt(sectionId, 10);
    if (isNaN(idAsNumber)) {
        return new NextResponse('Invalid section ID', { status: 400 });
    }

    const body: { playerData: Player } = await request.json();

    if (!body || !body.playerData) {
      return new NextResponse('Player data is required', { status: 400 });
    }

    const newPlayerNote = await prisma.playerNote.create({
      data: {
        sectionId: idAsNumber, 
        playerData: body.playerData as unknown as Prisma.JsonObject,
        notes: '', 
      },
    });

    return NextResponse.json(newPlayerNote, { status: 201 });
  } catch (error) {
    console.error('Error adding player:', error);
    if (error instanceof SyntaxError) {
      return new NextResponse('Invalid JSON in request body', { status: 400 });
    }
    return new NextResponse('Error adding player', { status: 500 });
  }
}