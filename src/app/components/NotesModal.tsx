// components/NotesModal.tsx
'use client';

import { useState, useEffect } from 'react';

// Interfaz para definir las propiedades que el modal necesita recibir
interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onSave: (newNotes: string) => void;
  playerName: string;
}

export default function NotesModal({
  isOpen,
  onClose,
  notes,
  onSave,
  playerName,
}: NotesModalProps) {
  const [currentNotes, setCurrentNotes] = useState(notes);

  // Sincroniza el estado interno si las notas iniciales cambian
  useEffect(() => {
    setCurrentNotes(notes);
  }, [notes]);
  
  // Si el modal no está abierto, no renderiza nada
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1">Notas para</h2>
        <h3 className="text-lg text-gray-700 mb-4">{playerName}</h3>
        <textarea
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          rows={6}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Añade tus notas aquí..."
        ></textarea>
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(currentNotes)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}