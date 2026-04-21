import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import AffordabilityForm, { AffordabilityFormData } from '@/components/AffordabilityForm';
import ResultCard from '@/components/ResultCard';
import { useCityData, useEstimateFlat, useEstimateHouse, FlatResult, HouseResult } from '@/hooks/usePropertyCalculator';
import { formatIndianAmount } from '@/lib/utils';

const HomePage: NextPage = () => {
  const { cities, isLoading: isLoadingCities, isError: citiesError } = useCityData();
  const { estimate: estimateFlat, result: flatResult, isLoading: isLoadingFlat, error: flatError } = useEstimateFlat();
  const { estimate: estimateHouse, result: houseResult, isLoading: isLoadingHouse, error: houseError } = useEstimateHouse();
  
  const [activeResult, setActiveResult] = useState<'flat' | 'house' | null>(null);
  
  const handleSubmit = (data: AffordabilityFormData) => {
    console.log("Form submitted with data:", data);
    
    if (data.propertyType === 'flat') {
      // Ensure all required fields are properly passed
      estimateFlat({
        city: data.city,
        builtUpSqft: data.builtUpSqft,
        budgetQuality: data.budgetQuality,
        gender: data.gender,
        pmayToggle: data.pmayToggle,
        gstToggle: data.gstToggle,
        loanPercent: data.loanPercent,
        interestRate: data.interestRate,
        loanTenureYears: data.loanTenureYears
      });
      setActiveResult('flat');
    } else {
      // Ensure all required fields are properly passed
      estimateHouse({
        city: data.city,
        plotSqft: data.plotSqft || 2000,
        builtUpSqft: data.builtUpSqft,
        landLocation: data.landLocation || 'suburb',
        customLandRate: data.customLandRate,
        quality: data.budgetQuality,
        includePermits: data.includePermits || true
      });
      setActiveResult('house');
    }
  };
  
  const renderFlatResult = (result: FlatResult) => (
    <div className="space-y-6">
      <ResultCard
        title="Total Property Cost"
        amount={result.totalPayable}
        description="Total amount payable for the property"
        subItems={[
          { label: 'Base Cost', value: result.baseCost },
          { label: 'GST', value: result.gst },
          { label: 'Stamp Duty', value: result.stampDuty },
          { label: 'Registration', value: result.registration }
        ]}
      />
      
      <ResultCard
        title="Monthly EMI"
        amount={result.emi}
        description={`Based on ${result.stateInfo?.state} stamp duty rates`}
      />
      
      {result.subsidySavings && (
        <ResultCard
          title="PMAY Subsidy Savings"
          amount={result.subsidySavings}
          description="Total savings over loan tenure through PMAY subsidy"
        />
      )}
      
      {result.additionalCosts && (
        <ResultCard
          title="Additional Costs"
          amount={result.additionalCosts.brokerageLegalFees + result.additionalCosts.furnishingSetupCosts + result.additionalCosts.maintenance + result.additionalCosts.propertyTax}
          description="Breakdown of additional costs"
          subItems={[
            { label: 'Brokerage & Legal Fees', value: result.additionalCosts.brokerageLegalFees },
            { label: 'Furnishing & Setup Costs', value: result.additionalCosts.furnishingSetupCosts },
            { label: 'Maintenance (20 Years)', value: result.additionalCosts.maintenance },
            { label: 'Property Tax (20 Years)', value: result.additionalCosts.propertyTax }
          ]}
        />
      )}
      
      {result.stale && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <p className="text-yellow-800 text-sm">
            Note: This calculation took longer than expected. The data may not reflect the latest updates.
          </p>
        </div>
      )}
    </div>
  );
  
  const renderHouseResult = (result: HouseResult) => (
    <div className="space-y-6">
      <ResultCard
        title="Total Build Cost"
        amount={result.totalBuildCost}
        description={`Estimated completion in ${result.timelineMonths} months`}
        subItems={[
          { label: 'Material Cost', value: result.materialCost },
          { label: 'Labour Cost', value: result.labourCost },
          ...(result.permitCost ? [{ label: 'Permit Cost', value: result.permitCost }] : []),
          ...(result.landCost ? [{ label: 'Land Cost', value: result.landCost }] : [])
        ]}
      />
      
      {result.materialsBreakdown && (
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Materials Breakdown</h3>
          
          <div className="space-y-3">
            {Object.entries(result.materialsBreakdown).map(([material, details]) => (
              <div key={material} className="border-b border-gray-100 pb-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium capitalize">{material}</span>
                  <span className="text-sm font-medium">{formatIndianAmount(details.cost)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {details.quantity.toFixed(2)} {details.unit} @ ₹{details.pricePerUnit}/unit
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result.permitList && result.permitList.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Required Permits</h3>
          
          <ul className="list-disc pl-5 space-y-1">
            {result.permitList.map((permit, index) => (
              <li key={index} className="text-sm text-gray-600">{permit}</li>
            ))}
          </ul>
        </div>
      )}
      
      {result.stale && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <p className="text-yellow-800 text-sm">
            Note: This calculation took longer than expected. The data may not reflect the latest updates.
          </p>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      <Head>
        <title>Indian Property Calculator | Affordability Wizard</title>
        <meta name="description" content="Calculate property costs, EMIs, and build estimates for Indian real estate" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="container">
        <header>
          <h1>Indian Property Calculator</h1>
          <p>Calculate property costs, EMIs, and build estimates for Indian real estate</p>
        </header>
        
        <div className="main-content">
          <div className="left-column">
            <div className="calculator-card">
              <div className="card-header">
                <h2>Affordability Wizard</h2>
              </div>
              <div className="card-body">
                <AffordabilityForm 
                  onSubmit={handleSubmit} 
                  cities={cities} 
                  isLoading={isLoadingFlat || isLoadingHouse}
                />
              </div>
            </div>
          </div>
          
          <div className="middle-column">
            {activeResult === 'flat' && flatResult && (
              <div className="results-section">
                <div className="card-header">
                  <h2>Flat Purchase Estimate</h2>
                </div>
                <div className="card-body">
                  <div className="results-grid">
                    <div className="result-item highlight">
                      <span className="result-label">Total Cost</span>
                      <span className="result-value">{formatIndianAmount(flatResult.totalPayable)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Base Cost</span>
                      <span className="result-value">{formatIndianAmount(flatResult.baseCost)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">GST</span>
                      <span className="result-value">{formatIndianAmount(flatResult.gst)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Stamp Duty</span>
                      <span className="result-value">{formatIndianAmount(flatResult.stampDuty)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Registration</span>
                      <span className="result-value">{formatIndianAmount(flatResult.registration)}</span>
                    </div>
                  </div>
                  
                  {flatResult.subsidySavings && (
                    <div className="savings-breakdown">
                      <h3>PMAY Subsidy Benefits</h3>
                      <div className="breakdown-grid">
                        <div className="breakdown-item">
                          <span>Subsidy Amount</span>
                          <span>{formatIndianAmount(flatResult.subsidySavings)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="borrowing-breakdown">
                    <h3>Loan Details</h3>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span>Loan Amount</span>
                        <span>{formatIndianAmount(flatResult.loanAmount || 0)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Down Payment</span>
                        <span>{formatIndianAmount(flatResult.downPayment || 0)}</span>
                      </div>
                      <div className="breakdown-item total-breakdown">
                        <span>Monthly EMI</span>
                        <span>{formatIndianAmount(flatResult.emi || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeResult === 'house' && houseResult && (
              <div className="results-section">
                <div className="card-header">
                  <h2>House Build Estimate</h2>
                </div>
                <div className="card-body">
                  <div className="results-grid">
                    <div className="result-item highlight">
                      <span className="result-label">Total Build Cost</span>
                      <span className="result-value">{formatIndianAmount(houseResult.totalBuildCost)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Material Cost</span>
                      <span className="result-value">{formatIndianAmount(houseResult.materialCost)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Labour Cost</span>
                      <span className="result-value">{formatIndianAmount(houseResult.labourCost)}</span>
                    </div>
                    {houseResult.permitCost && (
                      <div className="result-item">
                        <span className="result-label">Permit Cost</span>
                        <span className="result-value">{formatIndianAmount(houseResult.permitCost)}</span>
                      </div>
                    )}
                    {houseResult.landCost && (
                      <div className="result-item">
                        <span className="result-label">Land Cost</span>
                        <span className="result-value">{formatIndianAmount(houseResult.landCost)}</span>
                      </div>
                    )}
                    <div className="result-item total">
                      <span className="result-label">Estimated Time</span>
                      <span className="result-value">{houseResult.timelineMonths} months</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!activeResult && (
              <div className="placeholder-message">
                <div className="icon">🏠</div>
                <h3>Welcome to Property Calculator</h3>
                <p>Fill out the form to see detailed property cost estimates</p>
              </div>
            )}
            
            {(flatError || houseError) && (
              <div className="error-container">
                <div className="error-message">
                  <h3>Error Occurred</h3>
                  <p>{flatError?.message || houseError?.message || 'An unknown error occurred. Please try again.'}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="right-column">
            {activeResult === 'flat' && flatResult && (
              <div className="monthly-repayments-section">
                <div className="card-header">
                  <h2>EMI Breakdown</h2>
                </div>
                <div className="card-body">
                  <div className="repayment-grid">
                    <div className="repayment-item highlight">
                      <span className="repayment-label">Monthly EMI</span>
                      <span className="repayment-value">{formatIndianAmount(flatResult.emi || 0)}</span>
                    </div>
                    <div className="repayment-item">
                      <span className="repayment-label">Total Interest</span>
                      <span className="repayment-value">
                        {formatIndianAmount((flatResult.emi || 0) * 12 * (flatResult.loanTenureYears || 0) - (flatResult.loanAmount || 0))}
                      </span>
                    </div>
                    <div className="repayment-item">
                      <span className="repayment-label">Total Amount Payable</span>
                      <span className="repayment-value">
                        {formatIndianAmount((flatResult.emi || 0) * 12 * (flatResult.loanTenureYears || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeResult === 'house' && houseResult && houseResult.materialsBreakdown && (
              <div className="calculator-card">
                <div className="card-header">
                  <h2>Materials Breakdown</h2>
                </div>
                <div className="card-body">
                  <div className="breakdown-grid">
                    {Object.entries(houseResult.materialsBreakdown).map(([material, details]) => (
                      <div key={material} className="breakdown-item">
                        <span className="breakdown-label capitalize">{material}</span>
                        <span className="breakdown-value">{formatIndianAmount(details.cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeResult === 'house' && houseResult && houseResult.permitList && houseResult.permitList.length > 0 && (
              <div className="calculator-card" style={{marginTop: '15px'}}>
                <div className="card-header">
                  <h2>Required Permits</h2>
                </div>
                <div className="card-body">
                  <ul className="permit-list">
                    {houseResult.permitList.map((permit, index) => (
                      <li key={index} className="permit-item">{permit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <footer>
          <div className="disclaimer">
            <h3>Important Notes</h3>
            <p>This calculator provides estimates based on current market trends and averages. Actual costs may vary.</p>
            <ul>
              <li>Property prices vary significantly within cities based on exact location</li>
              <li>Material costs are subject to market fluctuations</li>
              <li>Labour costs may vary based on contractor and specific requirements</li>
            </ul>
            <p className="privacy-notice">All calculations are performed locally and no data is sent to external servers.</p>
          </div>
          <div className="author-details">
            <p>Built by Phani Marupaka | Made with ❤️ for Indian property buyers | <a href="#">About Us</a> | <a href="#">Privacy Policy</a></p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
