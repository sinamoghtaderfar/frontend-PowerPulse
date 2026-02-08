import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { Box, useTheme } from '@mui/material';

const ComparisonChart = ({ data }) => {
  const theme = useTheme();

  // Group data by year for chart
  const chartData = React.useMemo(() => {
    const years = [...new Set(data.map(item => item.year))].sort();
    return years.map(year => {
      const point = { year };
      data.forEach(item => {
        if (item.year === year) {
          point[item.model] = item.forecast;
          point[`${item.model}_lower`] = item.lower;
          point[`${item.model}_upper`] = item.upper;
        }
      });
      return point;
    });
  }, [data]);

  const models = [...new Set(data.map(item => item.model))];
  const colors = {
    'Prophet': '#4285F4',
    'Random Forest': '#34A853',
    'XGBoost': '#EA4335'
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme.palette.divider}
          vertical={false}
        />
        <XAxis 
          dataKey="year" 
          stroke={theme.palette.text.secondary}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <YAxis 
          stroke={theme.palette.text.secondary}
          tick={{ fill: theme.palette.text.secondary }}
          label={{ 
            value: 'Forecast Value', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: theme.palette.text.secondary }
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius
          }}
          formatter={(value, name) => [value?.toFixed(2) || 'N/A', name]}
        />
        <Legend />
        
        {models.map(model => (
          <Line
            key={model}
            type="monotone"
            dataKey={model}
            stroke={colors[model] || theme.palette.primary.main}
            strokeWidth={3}
            dot={{ strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name={model}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;