export interface EmergencyContact {
  name: string;
  number: string;
  type: 'police' | 'hospital' | 'fire' | 'ambulance' | 'disaster' | 'women' | 'child' | 'poison' | 'mental' | 'other';
  icon?: 'info';
  description?: string;
}

export interface Location {
  lat: number;
  lng: number;
  country?: string;
  city?: string;
  accuracy?: number; // Accuracy in meters
}

export interface MedicalFacility {
  id: string;
  name: string;
  location: Location;
  type: string;
  amenity: string;
  address?: string;
  phone?: string;
  emergency?: boolean;
  distance?: number;
}

export interface EmergencyService {
  name: string;
  location: Location;
  type: string;
  address?: string;
  phone?: string;
}

export interface LegalSection {
  _id?: string;
  id: string;
  code: string;  // e.g., "IPC 302"
  title: string;
  description: string;
  punishment: string;
  category: 'IPC' | 'CrPC' | 'Crimes against Human Body' | 'Crimes against Property' | 'Traffic Offenses' | 'Crimes against Women' | 'Economic Offenses';
  keywords: string[];
  relatedSections: string[];
  emergencyActions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LegalSearchResult {
  sections: LegalSection[];
  summary: string;
  emergencyActions: string[];
  relatedLaws: string[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  token?: string;
  bloodGroup?: string;
  address?: string;
  allergies?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface UnaddedLegalTerm {
  _id?: string;
  term: string;
  searchCount: number;
  lastSearched: Date;
  createdAt: Date;
  updatedAt: Date;
} 