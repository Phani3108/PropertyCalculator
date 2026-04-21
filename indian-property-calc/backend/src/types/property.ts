export interface Location {
  id: string;
  city: string;
  area: string;
  state: string;
}

export interface PropertyType {
  id: string;
  name: string;
  description: string | null;
}

export interface QualityLevel {
  id: string;
  name: string;
  description: string | null;
  costMultiplier: number;
}

export interface BaseRate {
  id: string;
  locationId: string;
  propertyTypeId: string;
  baseConstructionCost: number;
  baseLandCost: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

export interface PropertyCalculation {
  id: string;
  locationId: string;
  propertyTypeId: string;
  qualityLevelId: string;
  landAreaSqft: number;
  builtUpAreaSqft: number;
  constructionCost: number;
  landCost: number;
  totalCost: number;
}

export interface PropertyCalculationRequest {
  locationId: string;
  propertyTypeId: string;
  qualityLevelId: string;
  landAreaSqft: number;
  builtUpAreaSqft: number;
}

export interface PropertyCalculationResponse extends PropertyCalculation {
  location: Location;
  propertyType: PropertyType;
  qualityLevel: QualityLevel;
} 