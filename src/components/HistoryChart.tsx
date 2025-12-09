import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

interface HistoryEntry {
  date: string;
  score: number;
  total: number;
  percentage: number;
}

interface HistoryChartProps {
  history: HistoryEntry[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        {t.noHistory || 'Nessuno storico disponibile'}
      </div>
    );
  }

  const chartData = history.slice(-10).map((entry, index) => ({
    name: `#${index + 1}`,
    percentage: entry.percentage,
    score: entry.score,
    total: entry.total,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => [
              `${value}%`,
              t.percentage || 'Percentuale'
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            name={t.percentage || 'Percentuale'}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
