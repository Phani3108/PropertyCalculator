import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CalculatorCardProps {
  title: string;
  children: React.ReactNode;
  onCalculate?: () => void;
  calculateButtonText?: string;
  footer?: React.ReactNode;
  isCalculating?: boolean;
  helpText?: string;
}

export function CalculatorCard({
  title,
  children,
  onCalculate,
  calculateButtonText = 'Calculate',
  footer,
  isCalculating = false,
  helpText
}: CalculatorCardProps) {
  return (
    <Card className="calculator-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-gray-800 text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4 pt-2">
        {onCalculate && (
          <Button 
            onClick={onCalculate} 
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-lg"
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : calculateButtonText}
          </Button>
        )}
        
        {helpText && (
          <div className="info-box">
            <h3 className="text-primary mb-2 text-sm font-semibold">Help Information</h3>
            <p className="text-sm text-gray-600">{helpText}</p>
          </div>
        )}
        
        {footer}
      </CardFooter>
    </Card>
  );
}
