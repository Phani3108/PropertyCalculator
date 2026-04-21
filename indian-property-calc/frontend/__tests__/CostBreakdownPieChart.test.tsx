import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CostBreakdownPieChart from '../components/CostBreakdownPieChart';

// Mock the recharts library
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ data }: { data: any[] }) => (
      <div data-testid="pie">
        {data.map((entry, index) => (
          <div key={index} data-name={entry.name} data-value={entry.value} />
        ))}
      </div>
    ),
    Cell: () => <div data-testid="cell" />,
    Legend: () => <div data-testid="legend" />,
    Tooltip: () => <div data-testid="tooltip" />
  };
});

describe('CostBreakdownPieChart', () => {
  const mockData = [
    { name: 'Materials', value: 2000000 },
    { name: 'Labour', value: 1000000 },
    { name: 'Land', value: 3000000 },
    { name: 'Permits', value: 500000 }
  ];

  it('renders the chart with all cost components', () => {
    render(<CostBreakdownPieChart data={mockData} />);
    
    // Check if the chart container is rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });
  
  it('handles empty data array', () => {
    render(<CostBreakdownPieChart data={[]} />);
    
    // Should still render the container elements
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    
    // But pie should have no children (data points)
    expect(screen.getByTestId('pie').children.length).toBe(0);
  });
  
  it('applies cells to all data points', () => {
    render(<CostBreakdownPieChart data={mockData} />);
    
    // Check that all cells are rendered (for colors)
    const cells = screen.getAllByTestId('cell');
    expect(cells.length).toBe(4); // One for each cost component
  });
});
