// app/anotaciones/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';

// Helper para que SWR use fetch
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Tipado para la sección que viene de la API
interface SectionFromAPI {
    id: number;
    name: string;
    _count: {
        players: number;
    };
}

export default function AnotacionesPage() {
  const { data: sections, error, mutate } = useSWR<SectionFromAPI[]>('/api/sections', fetcher);
  const [newSectionName, setNewSectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSection = async () => {
    if (newSectionName.trim() === '') {
      alert('Por favor, introduce un nombre para la sección.');
      return;
    }
    setIsCreating(true);
    await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSectionName }),
    });
    setNewSectionName('');
    setIsCreating(false);
    mutate(); // Le dice a SWR que vuelva a cargar los datos
  };

  const handleEditSectionName = async (sectionId: number, currentName: string) => {
    const newName = prompt('Introduce el nuevo nombre para la sección:', currentName);

    // Si el usuario presiona "Cancelar" o deja el campo vacío, no hacemos nada
    if (!newName || newName.trim() === '') {
      return;
    }
    
    // Si el nombre no ha cambiado, tampoco hacemos nada
    if (newName.trim() === currentName) {
        return;
    }

    try {
      await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      mutate(); // Recargamos los datos para mostrar el nombre actualizado
    } catch (error) {
      console.error("Error al actualizar la sección:", error);
      alert("No se pudo actualizar la sección.");
    }
  };
  
  const handleDeleteSection = async (idToDelete: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta sección y todos sus jugadores?')) {
        await fetch(`/api/sections/${idToDelete}`, { method: 'DELETE' });
        mutate(); // Recargar datos
    }
  }

  if (error) return <div className="p-4 text-center">Error al cargar las secciones.</div>
  if (!sections) return <div className="p-4 text-center">Cargando...</div>

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold">Mis Anotaciones</h1>
        <Link href="/" className="text-blue-600 hover:underline self-start sm:self-auto">&larr; Volver a Estadísticas</Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Crear Nueva Sección</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Ej: Jugadores valiosos de Detroit"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          />
          <button
            onClick={handleCreateSection}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex-shrink-0"
            disabled={isCreating}
          >
            {isCreating ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Secciones Guardadas</h2>
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
               <Link href={`/anotaciones/${section.id}`} className="flex-grow w-full">
                 <h3 className="text-xl font-bold text-blue-700 hover:underline">{section.name}</h3>
                 <p className="text-gray-500">{section._count.players} jugador(es)</p>
               </Link>
               
               <div className="flex items-center gap-4 self-end sm:self-center flex-shrink-0">
                  <button onClick={() => handleEditSectionName(section.id, section.name)} className="text-gray-500 hover:text-blue-700 font-semibold py-1 px-4 rounded-md transition-colors">
                      Editar
                  </button>
                  <button onClick={() => handleDeleteSection(section.id)} className="text-red-500 hover:text-white hover:bg-red-600 font-semibold py-1 px-4 rounded-md transition-colors">
                      Eliminar
                  </button>
               </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aún no has creado ninguna sección.</p>
        )}
      </div>
    </main>
  );
}