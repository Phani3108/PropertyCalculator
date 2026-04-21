import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianAmount } from '@/lib/utils';

interface MaterialLabourChartProps {
  materials: number;
  labour: number;
  permits: number;
  land: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MaterialLabourChart: React.FC<MaterialLabourChartProps> = ({ 
  materials, 
  labour, 
  permits, 
  land 
}) => {
  const data = [
    { name: 'Materials', value: materials },
    { name: 'Labour', value: labour },
    { name: 'Permits', value: permits },
    { name: 'Land', value: land }
  ];

  const total = materials + labour + permits + land;

  // Add percentage to each data item
  const dataWithPercent = data.map(item => ({
    ...item,
    percent: item.value / total
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatIndianAmount(payload[0].value)}</p>
          <p className="text-sm">
            {(payload[0].payload.percent * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dataWithPercent}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {dataWithPercent.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value, entry: any) => (
            <span className="text-sm">
              {value}: {formatIndianAmount(entry.payload.value)} 
              ({(entry.payload.percent * 100).toFixed(1)}%)
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MaterialLabourChart;
