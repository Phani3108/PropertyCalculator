import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AffordabilityForm from '../components/AffordabilityForm';

// Mock the city data
const mockCities = [
  { name: 'Mumbai', state: 'Maharashtra', tier: '1', region: 'West' },
  { name: 'Delhi', state: 'Delhi', tier: '1', region: 'North' },
  { name: 'Bengaluru', state: 'Karnataka', tier: '1', region: 'South' }
];

// Mock the onSubmit function
const mockOnSubmit = jest.fn();

describe('AffordabilityForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the form with all fields', () => {
    render(
      <AffordabilityForm 
        cities={mockCities} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );
    
    // Check if essential form elements are rendered
    expect(screen.getByText(/Property Type/i)).toBeInTheDocument();
    expect(screen.getByText(/City/i)).toBeInTheDocument();
    expect(screen.getByText(/Built-up Area/i)).toBeInTheDocument();
    expect(screen.getByText(/Quality/i)).toBeInTheDocument();
    expect(screen.getByText(/Loan Details/i)).toBeInTheDocument();
    
    // Check if the Calculate button is present
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    expect(calculateButton).toBeInTheDocument();
  });
  
  it('shows/hides fields based on property type selection', () => {
    render(
      <AffordabilityForm 
        cities={mockCities} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );
    
    // Initially, it should show the flat-specific fields
    expect(screen.getByText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByText(/PMAY Subsidy/i)).toBeInTheDocument();
    
    // Change property type to "house"
    const propertyTypeSelect = screen.getByLabelText(/Property Type/i);
    fireEvent.change(propertyTypeSelect, { target: { value: 'house' } });
    
    // Now, it should show the house-specific fields
    expect(screen.getByText(/Plot Area/i)).toBeInTheDocument();
    expect(screen.getByText(/Land Location/i)).toBeInTheDocument();
  });
  
  it('submits the form with correct values', () => {
    render(
      <AffordabilityForm 
        cities={mockCities} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );
    
    // Fill in form values
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } });
    fireEvent.change(screen.getByLabelText(/Built-up Area/i), { target: { value: '1000' } });
    
    // Submit the form
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateButton);
    
    // Check if onSubmit was called with expected values
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      propertyType: 'flat',
      city: 'Mumbai',
      builtUpSqft: 1000
    }));
  });
  
  it('shows loading state when isLoading is true', () => {
    render(
      <AffordabilityForm 
        cities={mockCities} 
        onSubmit={mockOnSubmit} 
        isLoading={true} 
      />
    );
    
    // Button should be disabled and show loading text
    const calculateButton = screen.getByRole('button', { name: /Calculating/i });
    expect(calculateButton).toBeDisabled();
  });
});
