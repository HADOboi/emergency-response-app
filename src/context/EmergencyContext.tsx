import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmergencyContact, Location } from '../types';

// Add type declarations for Geolocation
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface GeolocationPositionError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

interface EmergencyContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  emergencyContacts: EmergencyContact[];
  loading: boolean;
  error: string | null;
  locationError: string | null;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

// Default location for Tirur, Kerala, India
const DEFAULT_LOCATION: Location = {
  lat: 10.9,
  lng: 75.92,
  country: 'India',
  city: 'Tirur'
};

const geolocationOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000, // Reduced timeout to 10 seconds
  maximumAge: 0 // Always get fresh location
};

// Accuracy thresholds
const ACCURACY_LEVELS = {
  EXCELLENT: 10,  // 10 meters - GPS with good signal
  GOOD: 20,       // 20 meters - GPS with moderate signal
  FAIR: 50,      // 50 meters - GPS with poor signal
  POOR: 100      // 100 meters - Network-based location
};

const MAXIMUM_ACCURACY_ATTEMPTS = 3; // Reduced attempts for faster response

interface EmergencyNumbers {
  police: string;
  ambulance: string;
  fire: string;
  women?: string;
  child?: string;
  mental?: string;
  poison?: string;
}

// Emergency numbers by country
const EMERGENCY_NUMBERS: Record<string, EmergencyNumbers> = {
  India: {
    police: '100',
    ambulance: '102',
    fire: '101',
    women: '1091',
    child: '1098',
    mental: '1800-599-0019',
    poison: '1066'
  },
  Germany: {
    police: '110',
    ambulance: '112',
    fire: '112',
    poison: '030 19240',
    mental: '0800 111 0 111'
  },
  'United States': {
    police: '911',
    ambulance: '911',
    fire: '911',
    poison: '1-800-222-1222',
    mental: '988',
    child: '1-800-422-4453'
  },
  'United Arab Emirates': {
    police: '999',
    ambulance: '998',
    fire: '997'
  },
  China: {
    police: '110',
    ambulance: '120',
    fire: '119'
  },
  Japan: {
    police: '110',
    ambulance: '119',
    fire: '119'
  },
  'United Kingdom': {
    police: '999',
    ambulance: '999',
    fire: '999'
  },
  Australia: {
    police: '000',
    ambulance: '000',
    fire: '000'
  },
  Singapore: {
    police: '999',
    ambulance: '995',
    fire: '995'
  },
  Canada: {
    police: '911',
    ambulance: '911',
    fire: '911'
  },
  France: {
    police: '17',
    ambulance: '15',
    fire: '18'
  }
};

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(DEFAULT_LOCATION);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [accuracyAttempts, setAccuracyAttempts] = useState(0);
  const [bestAccuracySoFar, setBestAccuracySoFar] = useState<number>(Infinity);

  // Function to get location name from coordinates using reverse geocoding
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      return {
        city: data.address?.city || data.address?.town || data.address?.village || '',
        country: data.address?.country || 'India'
      };
    } catch (error) {
      console.error('Error getting location name:', error);
      return { city: 'Tirur', country: 'India' };
    }
  };

  // Initialize emergency contacts with default location
  useEffect(() => {
    if (location) {
      const countryNumbers = EMERGENCY_NUMBERS[location.country as keyof typeof EMERGENCY_NUMBERS] || EMERGENCY_NUMBERS.India;

      const mainEmergencyNumbers = [
        {
          name: 'Police',
          number: countryNumbers.police,
          type: 'police' as const
        },
        {
          name: location.country === 'France' ? 'SAMU (Medical)' : 'Hospital/Ambulance',
          number: countryNumbers.ambulance,
          type: 'hospital' as const
        },
        {
          name: 'Fire Station',
          number: countryNumbers.fire,
          type: 'fire' as const
        }
      ];

      const additionalEmergencyNumbers: EmergencyContact[] = [];

      if (countryNumbers.women) {
        additionalEmergencyNumbers.push({
          name: 'Women Helpline',
          number: countryNumbers.women,
          type: 'women',
          description: '24/7 Women Safety & Support'
        });
      }

      if (countryNumbers.child) {
        additionalEmergencyNumbers.push({
          name: 'Child Helpline',
          number: countryNumbers.child,
          type: 'child',
          description: 'Child Protection & Support'
        });
      }

      if (countryNumbers.poison) {
        additionalEmergencyNumbers.push({
          name: 'Poison Control',
          number: countryNumbers.poison,
          type: 'poison',
          description: 'Poison Emergency & Information'
        });
      }

      if (countryNumbers.mental) {
        additionalEmergencyNumbers.push({
          name: 'Mental Health',
          number: countryNumbers.mental,
          type: 'mental',
          description: 'Mental Health Crisis Support'
        });
      }

      setEmergencyContacts([...mainEmergencyNumbers, ...additionalEmergencyNumbers]);
      setLoading(false);
    }
  }, [location]);

  // Get user's location
  useEffect(() => {
    let mounted = true;

    const handleSuccess = async (position: GeolocationPosition) => {
      if (!mounted) return;

      const { latitude, longitude, accuracy } = position.coords;
      
      if (!location || accuracy < (location.accuracy || Infinity)) {
        const locationDetails = await getLocationName(latitude, longitude);
        
        setLocation({
          lat: latitude,
          lng: longitude,
          ...locationDetails,
          accuracy
        });
        setLocationError(null);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (!mounted) return;

      let errorMessage = 'Unable to get precise location. ';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location access was denied.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Please ensure you are outdoors or near a window for better GPS signal.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Taking too long to get precise location. Please ensure GPS is enabled and you have clear sky view.';
          break;
        default:
          errorMessage += 'An unknown error occurred.';
      }

      setLocationError(errorMessage);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        location,
        setLocation,
        emergencyContacts,
        loading,
        error,
        locationError
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}; 