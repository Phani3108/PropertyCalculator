import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCityData } from '@/hooks/usePropertyCalculator';
import { formatIndianAmount } from '@/lib/utils';
import CostBreakdownPieChart from '@/components/CostBreakdownPieChart';
import EMISlider from '@/components/EMISlider';
import MaterialLabourChart from '@/components/MaterialLabourChart';

const CityDetailPage: NextPage = () => {
  const router = useRouter();
  const { city } = router.query;
  const { cities, isLoading: isLoadingCities } = useCityData();
  const [cityData, setCityData] = useState<any>(null);
  
  // Initialize with default values
  const [builtUpSqft, setBuiltUpSqft] = useState<number>(1000);
  const [quality, setQuality] = useState<string>('avg');
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  
  // Placeholder data - would be calculated based on real values in a real implementation
  const [flatCostBreakdown, setFlatCostBreakdown] = useState({
    baseCost: 0,
    gst: 0,
    stampDuty: 0,
    registration: 0,
    legalFees: 0
  });
  
  const [houseCostBreakdown, setHouseCostBreakdown] = useState({
    materials: 0,
    labour: 0,
    permits: 0,
    land: 0
  });
  
  useEffect(() => {
    if (cities && city) {
      const foundCity = cities.find((c: any) => c.name === city);
      if (foundCity) {
        setCityData(foundCity);
        
        // Calculate placeholder cost breakdowns
        // In a real implementation, these would be API calls
        const baseFlatCost = builtUpSqft * foundCity.construction[quality];
        setFlatCostBreakdown({
          baseCost: baseFlatCost,
          gst: baseFlatCost * 0.05,
          stampDuty: baseFlatCost * 0.06,
          registration: 30000,
          legalFees: 50000
        });
        
        const baseHouseCost = builtUpSqft * foundCity.construction[quality];
        setHouseCostBreakdown({
          materials: baseHouseCost * 0.6,
          labour: baseHouseCost * 0.3,
          permits: baseHouseCost * foundCity.permitPercent,
          land: 1000 * foundCity.land.suburb
        });
        
        // Default loan amount based on flat cost
        setLoanAmount(baseFlatCost * 0.8);
      }
    }
  }, [cities, city, builtUpSqft, quality]);
  
  if (isLoadingCities) {
    return <div className="container mx-auto py-8 text-center">Loading city data...</div>;
  }
  
  if (!cityData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">City not found</h1>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{cityData.name} Property Analysis | Indian Property Calculator</title>
        <meta name="description" content={`Detailed property analysis for ${cityData.name}, including costs, breakdowns, and EMI calculations`} />
      </Head>
      
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{cityData.name} Property Analysis</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
            <Button variant="outline" onClick={() => router.push('/compare')}>Compare Cities</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg">
          <div>
            <span className="text-sm text-gray-500">State</span>
            <p className="font-medium">{cityData.state}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Region</span>
            <p className="font-medium">{cityData.region}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Tier</span>
            <p className="font-medium">Tier {cityData.tier}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="flat">Flat/Apartment</TabsTrigger>
              <TabsTrigger value="house">House Construction</TabsTrigger>
              <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Construction Cost (₹/sqft)</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Budget Quality</span>
                      <span className="font-medium">{formatIndianAmount(cityData.construction.min)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Standard Quality</span>
                      <span className="font-medium">{formatIndianAmount(cityData.construction.avg)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Premium Quality</span>
                      <span className="font-medium">{formatIndianAmount(cityData.construction.max)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Land Cost (₹/sqft)</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>City Core</span>
                      <span className="font-medium">{formatIndianAmount(cityData.land.cityCore)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Suburb</span>
                      <span className="font-medium">{formatIndianAmount(cityData.land.suburb)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Labor & Material</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Labor Index</span>
                      <span className="font-medium">{cityData.laborIndex.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Material Index</span>
                      <span className="font-medium">{cityData.materialIndex.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Permit Cost</span>
                      <span className="font-medium">{(cityData.permitPercent * 100).toFixed(1)}% of construction</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Construction Timeline</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>1000 sqft House</span>
                      <span className="font-medium">{cityData.timelineMonthsPer1000Sqft} months</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Highrise Building</span>
                      <span className="font-medium">{cityData.timelineHighriseMonths} months</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="flat" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Flat Cost Breakdown</h2>
                  <div className="h-80">
                    <CostBreakdownPieChart data={[
                      { name: 'Base Cost', value: flatCostBreakdown.baseCost },
                      { name: 'GST', value: flatCostBreakdown.gst },
                      { name: 'Stamp Duty', value: flatCostBreakdown.stampDuty },
                      { name: 'Registration', value: flatCostBreakdown.registration },
                      { name: 'Legal Fees', value: flatCostBreakdown.legalFees }
                    ]} />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Flat Cost Details</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Base Cost</span>
                      <span className="font-medium">{formatIndianAmount(flatCostBreakdown.baseCost)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>GST (5%)</span>
                      <span className="font-medium">{formatIndianAmount(flatCostBreakdown.gst)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Stamp Duty (6%)</span>
                      <span className="font-medium">{formatIndianAmount(flatCostBreakdown.stampDuty)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Registration</span>
                      <span className="font-medium">{formatIndianAmount(flatCostBreakdown.registration)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Legal Fees</span>
                      <span className="font-medium">{formatIndianAmount(flatCostBreakdown.legalFees)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 font-semibold">
                      <span>Total Cost</span>
                      <span>{formatIndianAmount(
                        flatCostBreakdown.baseCost + 
                        flatCostBreakdown.gst + 
                        flatCostBreakdown.stampDuty + 
                        flatCostBreakdown.registration + 
                        flatCostBreakdown.legalFees
                      )}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="house" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">House Construction Breakdown</h2>
                  <div className="h-80">
                    <MaterialLabourChart 
                      materials={houseCostBreakdown.materials} 
                      labour={houseCostBreakdown.labour} 
                      permits={houseCostBreakdown.permits} 
                      land={houseCostBreakdown.land} 
                    />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">House Construction Details</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Materials</span>
                      <span className="font-medium">{formatIndianAmount(houseCostBreakdown.materials)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Labour</span>
                      <span className="font-medium">{formatIndianAmount(houseCostBreakdown.labour)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Permits & Approvals</span>
                      <span className="font-medium">{formatIndianAmount(houseCostBreakdown.permits)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Land (1000 sqft)</span>
                      <span className="font-medium">{formatIndianAmount(houseCostBreakdown.land)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 font-semibold">
                      <span>Total Cost</span>
                      <span>{formatIndianAmount(
                        houseCostBreakdown.materials + 
                        houseCostBreakdown.labour + 
                        houseCostBreakdown.permits + 
                        houseCostBreakdown.land
                      )}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span>Estimated Timeline</span>
                      <span className="font-medium">{cityData.timelineMonthsPer1000Sqft} months</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="emi" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">EMI Calculator</h2>
                  <EMISlider 
                    loanAmount={loanAmount}
                    interestRate={interestRate}
                    tenureYears={loanTenureYears}
                    onLoanAmountChange={setLoanAmount}
                    onInterestRateChange={setInterestRate}
                    onTenureYearsChange={setLoanTenureYears}
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Loan Details</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Loan Amount</span>
                      <span className="font-medium">{formatIndianAmount(loanAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Interest Rate</span>
                      <span className="font-medium">{interestRate}%</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Loan Tenure</span>
                      <span className="font-medium">{loanTenureYears} years</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Monthly EMI</span>
                      <span className="font-medium">{formatIndianAmount(
                        calculateEMI(loanAmount, interestRate, loanTenureYears)
                      )}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Total Interest</span>
                      <span className="font-medium">{formatIndianAmount(
                        (calculateEMI(loanAmount, interestRate, loanTenureYears) * loanTenureYears * 12) - loanAmount
                      )}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 font-semibold">
                      <span>Total Amount Payable</span>
                      <span>{formatIndianAmount(
                        calculateEMI(loanAmount, interestRate, loanTenureYears) * loanTenureYears * 12
                      )}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

// Simple EMI calculation function
function calculateEMI(principal: number, rate: number, years: number): number {
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
}

export default CityDetailPage;
