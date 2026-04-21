import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type AffordabilityFormData = {
  propertyType: 'flat' | 'house';
  city: string;
  builtUpSqft: number;
  budgetQuality: 'basic' | 'standard' | 'luxury';
  gender: 'male' | 'female';
  pmayToggle: boolean;
  gstToggle: boolean;
  // House specific
  plotSqft?: number;
  landLocation?: 'cityCore' | 'suburb' | 'custom';
  customLandRate?: number;
  includePermits?: boolean;
  // New fields
  floors: number;
  parkingType?: 'open' | 'covered' | 'basement';
  soilType?: 'normal' | 'rocky' | 'sandy' | 'black-cotton';
  amenities: {
    elevator: boolean;
    security: boolean;
    fireSafety: boolean;
    powerBackup: boolean;
    rainwaterHarvesting: boolean;
    solarPanels: boolean;
  };
  interiors: {
    modularKitchen: boolean;
    wardrobes: boolean;
    premiumFlooring: boolean;
    falseCeiling: boolean;
    wallFinishes: 'paint' | 'wallpaper' | 'premium';
  };
  utilities: {
    electricityConnection: boolean;
    waterConnection: boolean;
    sewageConnection: boolean;
    gasConnection: boolean;
  };
  professionalServices: {
    architect: boolean;
    structuralEngineer: boolean;
    interiorDesigner: boolean;
    projectManager: boolean;
    legalConsultant: boolean;
  };
  // Loan details
  loanPercent: number;
  interestRate: number;
  loanTenureYears: number;
};

interface AffordabilityFormProps {
  onSubmit: (data: AffordabilityFormData) => void;
  cities: Array<{ name: string; state: string; tier: string }>;
  isLoading?: boolean;
}

const AffordabilityForm: React.FC<AffordabilityFormProps> = ({ onSubmit, cities, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<string>('flat');
  const [formData, setFormData] = useState<AffordabilityFormData>({
    propertyType: 'flat',
    city: '',
    builtUpSqft: 1000,
    budgetQuality: 'standard',
    gender: 'male',
    pmayToggle: false,
    gstToggle: true,
    plotSqft: 2000,
    landLocation: 'suburb',
    includePermits: true,
    floors: 1,
    parkingType: 'open',
    soilType: 'normal',
    amenities: {
      elevator: false,
      security: true,
      fireSafety: true,
      powerBackup: true,
      rainwaterHarvesting: false,
      solarPanels: false,
    },
    interiors: {
      modularKitchen: true,
      wardrobes: true,
      premiumFlooring: false,
      falseCeiling: false,
      wallFinishes: 'paint',
    },
    utilities: {
      electricityConnection: true,
      waterConnection: true,
      sewageConnection: true,
      gasConnection: false,
    },
    professionalServices: {
      architect: true,
      structuralEngineer: true,
      interiorDesigner: false,
      projectManager: false,
      legalConsultant: true,
    },
    loanPercent: 80,
    interestRate: 8.5,
    loanTenureYears: 20,
  });

  const handleChange = (field: keyof AffordabilityFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Set property type based on active tab
    if (field === 'propertyType') {
      setActiveTab(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Set property type based on active tab before submitting
    const submitData = { ...formData, propertyType: activeTab as 'flat' | 'house' };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          handleChange('propertyType', value);
        }}
        className="w-full tabs-container"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 tabs-list">
          <TabsTrigger value="flat" className="tab-trigger">Flat Purchase</TabsTrigger>
          <TabsTrigger value="house" className="tab-trigger">House Build</TabsTrigger>
        </TabsList>
        
        <div className="space-y-4 tabs-content">
          <div className="form-row">
            <div className="form-group select-container">
              <Label htmlFor="city">City</Label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => handleChange('city', value)}
              >
                <SelectTrigger id="city" className="select-trigger">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent position="popper" className="select-content shadcn-select-content" sideOffset={5}>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name} className="select-option">
                      {city.name} ({city.state}, Tier {city.tier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label htmlFor="builtUpSqft">Built-up Area (sq ft)</Label>
              <Input
                id="builtUpSqft"
                type="number"
                value={formData.builtUpSqft}
                onChange={(e) => handleChange('builtUpSqft', Number(e.target.value))}
                min={100}
                max={10000}
                className="w-full"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group select-container">
              <Label htmlFor="budgetQuality">Budget Quality</Label>
              <Select 
                value={formData.budgetQuality} 
                onValueChange={(value) => handleChange('budgetQuality', value)}
              >
                <SelectTrigger id="budgetQuality" className="select-trigger">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent position="popper" className="select-content shadcn-select-content" sideOffset={5}>
                  <SelectItem value="basic" className="select-option">Basic</SelectItem>
                  <SelectItem value="standard" className="select-option">Standard</SelectItem>
                  <SelectItem value="luxury" className="select-option">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group select-container">
              <Label htmlFor="gender">Buyer Gender (for stamp duty)</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleChange('gender', value)}
              >
                <SelectTrigger id="gender" className="select-trigger">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent position="popper" className="select-content shadcn-select-content" sideOffset={5}>
                  <SelectItem value="male" className="select-option">Male</SelectItem>
                  <SelectItem value="female" className="select-option">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="flat" className="space-y-3">
            <div className="form-row">
              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="pmayToggle" className="toggle-label">PMAY Subsidy</Label>
                  <p className="toggle-description">
                    Pradhan Mantri Awas Yojana interest subsidy for eligible buyers
                  </p>
                </div>
                <Switch 
                  id="pmayToggle" 
                  checked={formData.pmayToggle}
                  onCheckedChange={(checked) => handleChange('pmayToggle', checked)}
                  className="form-switch"
                />
              </div>
              
              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="gstToggle" className="toggle-label">Apply GST</Label>
                  <p className="toggle-description">
                    GST for under-construction properties (5% with ITC)
                  </p>
                </div>
                <Switch 
                  id="gstToggle" 
                  checked={formData.gstToggle}
                  onCheckedChange={(checked) => handleChange('gstToggle', checked)}
                  className="form-switch"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="house" className="space-y-4">
            <div className="form-row">
              <div className="form-group">
                <Label htmlFor="plotSqft">Plot Area (sq ft)</Label>
                <Input
                  id="plotSqft"
                  type="number"
                  value={formData.plotSqft}
                  onChange={(e) => handleChange('plotSqft', Number(e.target.value))}
                  min={100}
                  max={100000}
                  className="w-full"
                />
              </div>

              <div className="form-group select-container">
                <Label htmlFor="landLocation">Land Location</Label>
                <Select 
                  value={formData.landLocation} 
                  onValueChange={(value) => handleChange('landLocation', value)}
                >
                  <SelectTrigger id="landLocation" className="select-trigger">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="select-content" sideOffset={5}>
                    <SelectItem value="cityCore">City Core</SelectItem>
                    <SelectItem value="suburb">Suburban Area</SelectItem>
                    <SelectItem value="custom">Custom Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.landLocation === 'custom' && (
              <div className="form-group">
                <Label htmlFor="customLandRate">Custom Land Rate (₹/sq ft)</Label>
                <Input
                  id="customLandRate"
                  type="number"
                  value={formData.customLandRate || ''}
                  onChange={(e) => handleChange('customLandRate', Number(e.target.value))}
                  min={0}
                  className="w-full"
                />
              </div>
            )}

            <div className="toggle-container">
              <div className="toggle-text">
                <Label htmlFor="includePermits" className="toggle-label">Include Permits & Approvals</Label>
                <p className="toggle-description">
                  Include costs for building permits and approvals
                </p>
              </div>
              <Switch 
                id="includePermits" 
                checked={formData.includePermits}
                onCheckedChange={(checked) => handleChange('includePermits', checked)}
                className="form-switch"
              />
            </div>
          </TabsContent>

          <div className="form-section">
            <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
            <div className="form-row">
              <div className="form-group">
                <Label htmlFor="loanPercent">Loan Percentage (%)</Label>
                <Input
                  id="loanPercent"
                  type="number"
                  value={formData.loanPercent}
                  onChange={(e) => handleChange('loanPercent', Number(e.target.value))}
                  min={0}
                  max={95}
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => handleChange('interestRate', Number(e.target.value))}
                  min={5}
                  max={20}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="loanTenureYears">Loan Tenure (Years)</Label>
              <Input
                id="loanTenureYears"
                type="number"
                value={formData.loanTenureYears}
                onChange={(e) => handleChange('loanTenureYears', Number(e.target.value))}
                min={5}
                max={30}
                className="w-full"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-lg font-semibold mb-3">Professional Services</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="architect" className="toggle-label">Architect</Label>
                  <p className="toggle-description">Professional design and planning services</p>
                </div>
                <Switch 
                  id="architect"
                  checked={formData.professionalServices.architect}
                  onCheckedChange={(checked) => 
                    handleChange('professionalServices', { ...formData.professionalServices, architect: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="structuralEngineer" className="toggle-label">Structural Engineer</Label>
                  <p className="toggle-description">Structural design and supervision</p>
                </div>
                <Switch 
                  id="structuralEngineer"
                  checked={formData.professionalServices.structuralEngineer}
                  onCheckedChange={(checked) => 
                    handleChange('professionalServices', { ...formData.professionalServices, structuralEngineer: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="interiorDesigner" className="toggle-label">Interior Designer</Label>
                  <p className="toggle-description">Interior planning and decoration</p>
                </div>
                <Switch 
                  id="interiorDesigner"
                  checked={formData.professionalServices.interiorDesigner}
                  onCheckedChange={(checked) => 
                    handleChange('professionalServices', { ...formData.professionalServices, interiorDesigner: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="projectManager" className="toggle-label">Project Manager</Label>
                  <p className="toggle-description">Construction management services</p>
                </div>
                <Switch 
                  id="projectManager"
                  checked={formData.professionalServices.projectManager}
                  onCheckedChange={(checked) => 
                    handleChange('professionalServices', { ...formData.professionalServices, projectManager: checked })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-lg font-semibold mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="elevator" className="toggle-label">Elevator</Label>
                  <p className="toggle-description">Passenger lift installation</p>
                </div>
                <Switch 
                  id="elevator"
                  checked={formData.amenities.elevator}
                  onCheckedChange={(checked) => 
                    handleChange('amenities', { ...formData.amenities, elevator: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="security" className="toggle-label">Security System</Label>
                  <p className="toggle-description">CCTV and access control</p>
                </div>
                <Switch 
                  id="security"
                  checked={formData.amenities.security}
                  onCheckedChange={(checked) => 
                    handleChange('amenities', { ...formData.amenities, security: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="powerBackup" className="toggle-label">Power Backup</Label>
                  <p className="toggle-description">Generator/inverter system</p>
                </div>
                <Switch 
                  id="powerBackup"
                  checked={formData.amenities.powerBackup}
                  onCheckedChange={(checked) => 
                    handleChange('amenities', { ...formData.amenities, powerBackup: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="solarPanels" className="toggle-label">Solar Panels</Label>
                  <p className="toggle-description">Renewable energy system</p>
                </div>
                <Switch 
                  id="solarPanels"
                  checked={formData.amenities.solarPanels}
                  onCheckedChange={(checked) => 
                    handleChange('amenities', { ...formData.amenities, solarPanels: checked })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-lg font-semibold mb-3">Interiors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="modularKitchen" className="toggle-label">Modular Kitchen</Label>
                  <p className="toggle-description">Custom kitchen installation</p>
                </div>
                <Switch 
                  id="modularKitchen"
                  checked={formData.interiors.modularKitchen}
                  onCheckedChange={(checked) => 
                    handleChange('interiors', { ...formData.interiors, modularKitchen: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="wardrobes" className="toggle-label">Built-in Wardrobes</Label>
                  <p className="toggle-description">Custom storage solutions</p>
                </div>
                <Switch 
                  id="wardrobes"
                  checked={formData.interiors.wardrobes}
                  onCheckedChange={(checked) => 
                    handleChange('interiors', { ...formData.interiors, wardrobes: checked })}
                />
              </div>

              <div className="form-group select-container">
                <Label htmlFor="wallFinishes">Wall Finishes</Label>
                <Select 
                  value={formData.interiors.wallFinishes} 
                  onValueChange={(value: 'paint' | 'wallpaper' | 'premium') => 
                    handleChange('interiors', { ...formData.interiors, wallFinishes: value })}
                >
                  <SelectTrigger id="wallFinishes">
                    <SelectValue placeholder="Select finish type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paint">Standard Paint</SelectItem>
                    <SelectItem value="wallpaper">Wallpaper</SelectItem>
                    <SelectItem value="premium">Premium Finish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="premiumFlooring" className="toggle-label">Premium Flooring</Label>
                  <p className="toggle-description">High-quality floor finishes</p>
                </div>
                <Switch 
                  id="premiumFlooring"
                  checked={formData.interiors.premiumFlooring}
                  onCheckedChange={(checked) => 
                    handleChange('interiors', { ...formData.interiors, premiumFlooring: checked })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-lg font-semibold mb-3">Utilities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="electricityConnection" className="toggle-label">Electricity Connection</Label>
                  <p className="toggle-description">Power connection and meter</p>
                </div>
                <Switch 
                  id="electricityConnection"
                  checked={formData.utilities.electricityConnection}
                  onCheckedChange={(checked) => 
                    handleChange('utilities', { ...formData.utilities, electricityConnection: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="waterConnection" className="toggle-label">Water Connection</Label>
                  <p className="toggle-description">Municipal water supply</p>
                </div>
                <Switch 
                  id="waterConnection"
                  checked={formData.utilities.waterConnection}
                  onCheckedChange={(checked) => 
                    handleChange('utilities', { ...formData.utilities, waterConnection: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="sewageConnection" className="toggle-label">Sewage Connection</Label>
                  <p className="toggle-description">Municipal sewage system</p>
                </div>
                <Switch 
                  id="sewageConnection"
                  checked={formData.utilities.sewageConnection}
                  onCheckedChange={(checked) => 
                    handleChange('utilities', { ...formData.utilities, sewageConnection: checked })}
                />
              </div>

              <div className="toggle-container">
                <div className="toggle-text">
                  <Label htmlFor="gasConnection" className="toggle-label">Gas Connection</Label>
                  <p className="toggle-description">Piped natural gas</p>
                </div>
                <Switch 
                  id="gasConnection"
                  checked={formData.utilities.gasConnection}
                  onCheckedChange={(checked) => 
                    handleChange('utilities', { ...formData.utilities, gasConnection: checked })}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="calculate-btn w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Calculate Property Cost'}
          </Button>
        </div>
      </Tabs>
    </form>
  );
};

export default AffordabilityForm;
