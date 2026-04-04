'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface GameLog {
  date: string;
  opponent: string;
  hits: number;
  rbi: number;
  runs: number;
  bb: number;
  so: number;
  er: number;
  p_so: number;
  p_bb: number;
}

interface Props {
  playerId: number;
  playerName: string;
  group: 'hitting' | 'pitching';
}

export default function PlayerPerformanceChart({ playerId, playerName, group }: Props) {
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<string>(group === 'hitting' ? 'hits' : 'p_so');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/players/${playerId}/log?group=${group}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [playerId, group]);

  const metrics = group === 'hitting' 
    ? [
        { id: 'hits', label: 'Hits', color: '#3b82f6' },
        { id: 'rbi', label: 'Impulsadas', color: '#10b981' },
        { id: 'runs', label: 'Carreras', color: '#f59e0b' },
        { id: 'bb', label: 'Boletos', color: '#6366f1' },
        { id: 'so', label: 'Ponches', color: '#ef4444' }
      ]
    : [
        { id: 'p_so', label: 'Ponches', color: '#3b82f6' },
        { id: 'p_bb', label: 'Boletos', color: '#6366f1' },
        { id: 'er', label: 'Carreras Limpias', color: '#ef4444' }
      ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50/50 rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500">No hay datos históricos suficientes para generar la gráfica en 2026.</p>
      </div>
    );
  }

  const activeColor = metrics.find(m => m.id === activeMetric)?.color || '#3b82f6';

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap gap-2">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => setActiveMetric(metric.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeMetric === metric.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="h-[300px] w-full bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={logs}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              fontSize={10} 
              tickFormatter={(val) => val.split('-').slice(1).join('/')} 
              stroke="#94a3b8"
            />
            <YAxis fontSize={10} stroke="#94a3b8" width={30} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
              formatter={(value, name) => [value, metrics.find(m => m.id === activeMetric)?.label]}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={activeColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-[10px] text-center text-gray-400 italic">Desempeño juego a juego - Temporada 2026</p>
    </div>
  );
}
