import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useComparisonData, useCityData } from '@/hooks/usePropertyCalculator';
import { formatIndianAmount } from '@/lib/utils';
import ComparisonBarChart from '@/components/ComparisonBarChart';
import ComparisonTable from '@/components/ComparisonTable';

type ComparisonCategory = 'flat' | 'house' | 'land' | 'wages';
type ComparisonType = 'city' | 'state' | 'tier' | 'region';

const ComparePage: NextPage = () => {
  const { cities, isLoading: isLoadingCities } = useCityData();
  const [category, setCategory] = useState<ComparisonCategory>('flat');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('city');
  const [builtUpSqft, setBuiltUpSqft] = useState<number>(1000);
  const [propertyQuality, setPropertyQuality] = useState<string>('avg');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Maximum of 5 items for better visualization
  const maxSelections = 5;
  
  const { compare, comparisonResult, isLoading: isLoadingComparison } = useComparisonData();
  
  const availableItems = comparisonType === 'city' 
    ? cities?.map((city: any) => city.name) || []
    : comparisonType === 'state'
    ? [...new Set(cities?.map((city: any) => city.state) || [])]
    : comparisonType === 'tier'
    ? ['1', '2', '3']
    : ['North', 'South', 'East', 'West', 'Central'];
  
  const handleCompare = () => {
    if (selectedItems.length === 0) return;
    
    compare({
      category,
      type: comparisonType,
      items: selectedItems,
      parameters: {
        builtUpSqft,
        quality: propertyQuality
      }
    });
  };
  
  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else if (selectedItems.length < maxSelections) {
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  return (
    <>
      <Head>
        <title>Property Comparison | Indian Property Calculator</title>
        <meta name="description" content="Compare property costs across different cities, states, and regions in India" />
      </Head>
      
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-3xl font-bold text-center">Property Cost Comparison</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="settings">Comparison Settings</TabsTrigger>
              <TabsTrigger value="results" disabled={!comparisonResult}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">What would you like to compare?</Label>
                    <Select 
                      value={category} 
                      onValueChange={(value: ComparisonCategory) => setCategory(value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat/Apartment Costs</SelectItem>
                        <SelectItem value="house">House Construction Costs</SelectItem>
                        <SelectItem value="land">Land Prices</SelectItem>
                        <SelectItem value="wages">Labor Wages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="comparisonType">Compare by</Label>
                    <Select 
                      value={comparisonType} 
                      onValueChange={(value: ComparisonType) => {
                        setComparisonType(value);
                        setSelectedItems([]);
                      }}
                    >
                      <SelectTrigger id="comparisonType">
                        <SelectValue placeholder="Select comparison type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city">Cities</SelectItem>
                        <SelectItem value="state">States</SelectItem>
                        <SelectItem value="tier">City Tiers</SelectItem>
                        <SelectItem value="region">Regions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="builtUpArea">Built-up Area (sqft)</Label>
                    <Select 
                      value={builtUpSqft.toString()} 
                      onValueChange={(value) => setBuiltUpSqft(parseInt(value))}
                    >
                      <SelectTrigger id="builtUpArea">
                        <SelectValue placeholder="Select built-up area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="600">600 sqft</SelectItem>
                        <SelectItem value="1000">1000 sqft</SelectItem>
                        <SelectItem value="1500">1500 sqft</SelectItem>
                        <SelectItem value="2000">2000 sqft</SelectItem>
                        <SelectItem value="2500">2500 sqft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quality">Property Quality</Label>
                    <Select 
                      value={propertyQuality} 
                      onValueChange={(value) => setPropertyQuality(value)}
                    >
                      <SelectTrigger id="quality">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="min">Budget</SelectItem>
                        <SelectItem value="avg">Standard</SelectItem>
                        <SelectItem value="max">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Select up to {maxSelections} items to compare</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {isLoadingCities ? (
                      <div className="col-span-2 text-center py-4">Loading available options...</div>
                    ) : (
                      availableItems.map((item: string) => (
                        <Button
                          key={item}
                          variant={selectedItems.includes(item) ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => toggleItem(item)}
                        >
                          {item}
                        </Button>
                      ))
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleCompare} 
                      disabled={selectedItems.length === 0 || isLoadingComparison}
                      className="w-full"
                    >
                      {isLoadingComparison ? 'Comparing...' : 'Compare Now'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="results">
              {comparisonResult && (
                <div className="space-y-8">
                  <div className="h-96">
                    <ComparisonBarChart data={comparisonResult} category={category} />
                  </div>
                  
                  <ComparisonTable data={comparisonResult} category={category} />
                  
                  <div className="flex justify-center pt-4">
                    <Button onClick={() => window.print()} variant="outline">
                      Print/Save as PDF
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ComparePage;
