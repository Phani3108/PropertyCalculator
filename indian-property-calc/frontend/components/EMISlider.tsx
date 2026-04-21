import React from 'react';
import { Slider } from '@/components/ui/slider';
import { formatIndianAmount } from '@/lib/utils';

interface EMISliderProps {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  onLoanAmountChange: (value: number) => void;
  onInterestRateChange: (value: number) => void;
  onTenureYearsChange: (value: number) => void;
}

const EMISlider: React.FC<EMISliderProps> = ({
  loanAmount,
  interestRate,
  tenureYears,
  onLoanAmountChange,
  onInterestRateChange,
  onTenureYearsChange
}) => {
  // Calculate EMI
  const calculateEMI = (): number => {
    const monthlyRate = interestRate / 12 / 100;
    const months = tenureYears * 12;
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return isNaN(emi) ? 0 : emi;
  };

  const emi = calculateEMI();

  // Format for displaying as comma-separated amount
  const formatAmount = (amount: number): string => formatIndianAmount(amount);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Loan Amount</span>
          <span className="text-sm font-medium">{formatAmount(loanAmount)}</span>
        </div>
        <Slider
          value={[loanAmount]}
          min={100000}
          max={10000000}
          step={100000}
          onValueChange={(values) => onLoanAmountChange(values[0])}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>₹1 Lakh</span>
          <span>₹1 Crore</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Interest Rate</span>
          <span className="text-sm font-medium">{interestRate}%</span>
        </div>
        <Slider
          value={[interestRate]}
          min={5}
          max={15}
          step={0.1}
          onValueChange={(values) => onInterestRateChange(values[0])}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>5%</span>
          <span>15%</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Loan Tenure</span>
          <span className="text-sm font-medium">{tenureYears} years</span>
        </div>
        <Slider
          value={[tenureYears]}
          min={1}
          max={30}
          step={1}
          onValueChange={(values) => onTenureYearsChange(values[0])}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1 year</span>
          <span>30 years</span>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="text-center">
          <span className="text-sm text-gray-500">Your Monthly EMI</span>
          <div className="text-2xl font-bold text-blue-600">{formatAmount(emi)}</div>
          <span className="text-xs text-gray-500">
            Total Payment: {formatAmount(emi * tenureYears * 12)} | 
            Total Interest: {formatAmount((emi * tenureYears * 12) - loanAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EMISlider;
