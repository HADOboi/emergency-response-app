import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl, useMap } from 'react-leaflet';
import { Box, CircularProgress, Typography, Alert, Chip, Button, Collapse, IconButton, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment } from '@mui/material';
import { useEmergency } from '../context/EmergencyContext';
import { MedicalFacility, EmergencyContact } from '../types';
import { fetchNearbyMedicalFacilities } from '../utils/medicalFacilities';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DirectionsIcon from '@mui/icons-material/Directions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import SearchIcon from '@mui/icons-material/Search';
import LegalSearch from './LegalSearch';
import { searchLegalInformation } from '../services/legalSearch';
import GavelIcon from '@mui/icons-material/Gavel';
import { alpha } from '@mui/material/styles';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import FireTruckIcon from '@mui/icons-material/FireTruck';
import WomanIcon from '@mui/icons-material/Woman';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useUser } from '../context/UserContext';

// Fix for default marker icons in Leaflet with React
const icon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
  shadowPopupAnchor: [1, -34],
  tooltipAnchor: [16, -28]
});

L.Marker.prototype.options.icon = icon;

// Create custom icons for different types of facilities
const createIcon = (color: string, isUser: boolean = false) => new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      ${isUser ? '' : '<path fill="white" d="M11 7h2v2h2v2h-2v2h-2v-2H9V9h2z"/>'}
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  marginTop: '16px',
  zIndex: 1
};

const mapSettings = {
  zoom: 13,
  minZoom: 4,
  maxZoom: 18,
  zoomControl: false
};

// Update icons to include police and fire stations
const icons = {
  hospital: createIcon('#e53935'), // Red
  clinic: createIcon('#fb8c00'), // Orange
  emergency: createIcon('#d32f2f'), // Dark Red
  police: createIcon('#1a237e'), // Dark Blue
  fire: createIcon('#bf360c'), // Dark Orange
  default: createIcon('#1976d2'), // Blue
  user: createIcon('#4CAF50', true) // Green for user location, without cross
};

// Custom styles for facility type chips
const chipStyles = {
  hospital: {
    bgcolor: '#ff1744',
    color: 'white',
    '&:hover': { bgcolor: '#d50000' }
  },
  clinic: {
    bgcolor: '#ff9100',
    color: 'white',
    '&:hover': { bgcolor: '#ff6d00' }
  },
  police: {
    bgcolor: '#304ffe',
    color: 'white',
    '&:hover': { bgcolor: '#1a237e' }
  },
  fire: {
    bgcolor: '#ff3d00',
    color: 'white',
    '&:hover': { bgcolor: '#dd2c00' }
  },
  emergency: {
    bgcolor: '#d50000',
    color: 'white',
    border: '2px solid #ff1744',
    '&:hover': { bgcolor: '#b71c1c' }
  }
};

// Component to handle map operations
const MapController: React.FC<{ nearest: MedicalFacility | null }> = ({ nearest }) => {
  const map = useMap();

  useEffect(() => {
    if (nearest) {
      // Fit the map to show both current location and nearest hospital
      const bounds = L.latLngBounds(
        [nearest.location.lat, nearest.location.lng],
        [map.getCenter().lat, map.getCenter().lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [nearest, map]);

  return null;
};

const EmergencyMap: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const { location, locationError, emergencyContacts, setLocation } = useEmergency();
  const { user } = useUser();
  const [medicalFacilities, setMedicalFacilities] = useState<MedicalFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [facilitiesLoaded, setFacilitiesLoaded] = useState(false);
  const [nearestHospital, setNearestHospital] = useState<MedicalFacility | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EmergencyContact[]>([]);
  const [isLegalSearchMode, setIsLegalSearchMode] = useState(false);
  const [isInIndia, setIsInIndia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMobileOnlyDialog, setShowMobileOnlyDialog] = useState(false);

  const mainEmergencyContacts = emergencyContacts.filter(contact => 
    contact.type === 'police' || contact.type === 'hospital' || contact.type === 'fire'
  );
  const additionalEmergencyContacts = emergencyContacts.filter(contact => 
    contact.type !== 'police' && contact.type !== 'hospital' && contact.type !== 'fire'
  );

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = emergencyContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.number.includes(searchQuery) ||
        (contact.description && contact.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, emergencyContacts]);

  // Function to find nearest hospital and show route
  const showNearestHospital = useCallback(() => {
    const hospitals = medicalFacilities.filter(f => f.type === 'hospital');
    if (hospitals.length > 0) {
      // Get the nearest hospital (already sorted by distance)
      const nearest = hospitals[0];
      setNearestHospital(nearest);

      // Create Google Maps URL with directions
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${nearest.location.lat},${nearest.location.lng}&travelmode=driving`;
      window.open(googleMapsUrl, '_blank');
    }
  }, [medicalFacilities, location]);

  // Fetch medical facilities only once when we get the initial location
  useEffect(() => {
    const fetchFacilities = async () => {
      if (location && !facilitiesLoaded) {
        setLoading(true);
        try {
          const facilities = await fetchNearbyMedicalFacilities(location);
          setMedicalFacilities(facilities);
          setFacilitiesLoaded(true);
        } catch (error) {
          console.error('Error fetching medical facilities:', error);
        }
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [location, facilitiesLoaded]);

  // Check if user is in India
  useEffect(() => {
    if (location?.country === 'India') {
      setIsInIndia(true);
    }
  }, [location?.country]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            country: 'India', // You might want to get this from a geocoding service
            city: 'Tirur',    // You might want to get this from a geocoding service
          });
        },
        (error) => {
          setError('Error getting location: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }, [setLocation]);

  const handleEmergencyCall = (contact: EmergencyContact) => {
    if (isMobile) {
      window.location.href = `tel:${contact.number}`;
    } else {
      setSelectedContact(contact);
    }
  };

  const handleCloseDialog = () => {
    setSelectedContact(null);
  };

  const handleEmergencyContact = async () => {
    try {
      // Fetch user profile to get emergency contact
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      
      if (!profile.emergencyContact?.phone) {
        setError('Please add an emergency contact in your profile first');
        return;
      }

      if (isMobile) {
        // For mobile devices, create SMS content
        const message = `Emergency Alert: ${user?.name} needs help!\n\nLocation: ${location?.city || 'Unknown'}, ${location?.country || 'Unknown'}\nCoordinates: ${location?.lat || 'Unknown'}, ${location?.lng || 'Unknown'}\n\nMedical Info:\nBlood Group: ${profile.bloodGroup || 'Not specified'}\nAllergies: ${profile.allergies?.join(', ') || 'None'}\n\nPlease respond immediately!`;
        
        // Create SMS URL
        const smsUrl = `sms:${profile.emergencyContact.phone}?body=${encodeURIComponent(message)}`;
        
        // Open SMS app
        window.location.href = smsUrl;
        
        // Show success message
        setSuccess('SMS app opened. Please send the message to your emergency contact.');
      } else {
        // For desktop, show the mobile-only dialog
        setShowMobileOnlyDialog(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send emergency contact');
    }
  };

  const handleCloseMobileOnlyDialog = () => {
    setShowMobileOnlyDialog(false);
  };

  if (locationError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {locationError}
        </Alert>
        {location && (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={14}
            style={mapContainerStyle}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]} icon={icons.user}>
              <Popup>
                Default Location
                <br />
                {location.city && location.city}
                {location.country && `, ${location.country}`}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </Box>
    );
  }

  if (!location) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 1, sm: 3 },
        background: (theme) => 
          theme.palette.mode === 'dark'
            ? 'linear-gradient(165deg, rgba(22, 25, 30, 0.98) 0%, rgba(15, 18, 23, 0.98) 100%)'
            : 'linear-gradient(165deg, rgba(250, 252, 255, 0.9) 0%, rgba(240, 245, 255, 0.9) 100%)',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Search Section */}
      <Box 
        id="search" 
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
          },
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'linear-gradient(145deg, #1a1d22 0%, #13161c 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: 'primary.main',
            fontWeight: 700,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontFamily: '"Poppins", sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              color: 'primary.light',
              textShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
          }}
        >
          <SearchIcon /> Search Emergency Services
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={isLegalSearchMode ? "Search for legal information..." : "Search emergency services..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isLegalSearchMode) {
                const results = emergencyContacts.filter(contact =>
                  contact.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                  contact.number.includes(e.target.value) ||
                  (contact.description && contact.description.toLowerCase().includes(e.target.value.toLowerCase()))
                );
                setSearchResults(results);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && isLegalSearchMode) {
                e.preventDefault();
                searchLegalInformation(searchQuery, true).catch(console.error);
              }
            }}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isLegalSearchMode ? <GavelIcon /> : <SearchIcon />}
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={isLegalSearchMode ? "contained" : "outlined"}
            color="primary"
            onClick={() => {
              setIsLegalSearchMode(!isLegalSearchMode);
              setSearchQuery('');
              setSearchResults([]);
            }}
            startIcon={<GavelIcon />}
            title="Toggle Legal Search Mode"
            sx={{
              borderRadius: 2,
              px: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          >
            Legal
          </Button>
        </Box>
      </Box>

      {/* Search Results */}
      {isLegalSearchMode ? (
        <LegalSearch
          isAvailable={isInIndia}
          onSearch={searchLegalInformation}
          initialQuery={searchQuery}
          onEmergencyActionClick={(type) => {
            const contact = emergencyContacts.find(c => c.type === type);
            if (contact) {
              const buttonsSection = document.getElementById('emergency-buttons');
              if (buttonsSection) {
                buttonsSection.scrollIntoView({ behavior: 'smooth' });
              }
              setTimeout(() => handleEmergencyCall(contact), 500);
            }
          }}
        />
      ) : searchResults.length > 0 && (
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
          },
          background: (theme) => 
            theme.palette.mode === 'dark' ? '#1a1d22' : '#ffffff',
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Search Results ({searchResults.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {searchResults.map((contact) => (
              <Button
                key={contact.type}
                variant="outlined"
                color="primary"
                startIcon={<LocalPhoneIcon />}
                onClick={() => handleEmergencyCall(contact)}
                sx={{ width: '100%' }}
              >
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography variant="button" display="block">
                    {contact.name}: {contact.number}
                  </Typography>
                  {contact.description && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {contact.description}
                    </Typography>
                  )}
                </Box>
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Emergency Buttons Section */}
      <Box 
        id="emergency-buttons" 
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
          },
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'linear-gradient(145deg, #1a1d22 0%, #13161c 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: 'primary.main',
            fontWeight: 700,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontFamily: '"Poppins", sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              color: 'primary.light',
              textShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
          }}
        >
          <LocalHospitalIcon /> Emergency Services
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%'
          }}
        >
          {mainEmergencyContacts.map((contact) => (
            <Button
              key={contact.name}
              variant="outlined"
              onClick={() => handleEmergencyCall(contact)}
              sx={{
                flex: 1,
                minHeight: { xs: '80px', sm: '100px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 2,
                borderRadius: 2,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'normal',
                textAlign: 'center',
                background: (theme) => theme.palette.mode === 'dark'
                  ? contact.type === 'police' 
                    ? '#0a2465'
                    : contact.type === 'hospital'
                    ? '#8b0000'
                    : contact.type === 'fire'
                    ? '#982800'
                    : 'transparent'
                  : contact.type === 'police' 
                    ? '#1a76d2'
                    : contact.type === 'hospital'
                    ? '#d32f2f'
                    : contact.type === 'fire'
                    ? '#ed6c02'
                    : 'transparent',
                color: ['police', 'hospital', 'fire'].includes(contact.type) ? 'white' : 'inherit',
                borderColor: (theme) => theme.palette.mode === 'dark'
                  ? contact.type === 'police'
                    ? '#051c4e'
                    : contact.type === 'hospital'
                    ? '#6b0000'
                    : contact.type === 'fire'
                    ? '#7a2000'
                    : 'inherit'
                  : contact.type === 'police'
                    ? '#0d47a1'
                    : contact.type === 'hospital'
                    ? '#b71c1c'
                    : contact.type === 'fire'
                    ? '#e65100'
                    : 'inherit',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  background: (theme) => theme.palette.mode === 'dark'
                    ? contact.type === 'police'
                      ? '#163385'
                      : contact.type === 'hospital'
                      ? '#a01c1c'
                      : contact.type === 'fire'
                      ? '#a63603'
                      : 'inherit'
                    : contact.type === 'police'
                      ? '#1565c0'
                      : contact.type === 'hospital'
                      ? '#c62828'
                      : contact.type === 'fire'
                      ? '#e65100'
                      : 'inherit',
                  borderColor: (theme) => theme.palette.mode === 'dark'
                    ? contact.type === 'police'
                      ? '#0a2465'
                      : contact.type === 'hospital'
                      ? '#8b0000'
                      : contact.type === 'fire'
                      ? '#982800'
                      : 'inherit'
                    : contact.type === 'police'
                      ? '#0d47a1'
                      : contact.type === 'hospital'
                      ? '#b71c1c'
                      : contact.type === 'fire'
                      ? '#e65100'
                      : 'inherit',
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                {contact.type === 'police' && <LocalPoliceIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
                {contact.type === 'hospital' && <LocalHospitalIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
                {contact.type === 'fire' && <FireTruckIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
                {contact.type === 'women' && <WomanIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
                {contact.type === 'child' && <ChildCareIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
                {contact.type === 'mental' && <PsychologyIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
                {contact.type === 'poison' && <WarningIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {contact.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {contact.number}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>

        <Button
          variant="outlined"
          color="primary"
          startIcon={showMore ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowMore(!showMore)}
          sx={{ mb: 2, width: '100%' }}
        >
          {showMore ? 'Hide Additional Services' : 'Show Additional Services'}
        </Button>

        <Collapse in={showMore}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {additionalEmergencyContacts.map((contact) => (
              <Button
                key={contact.type}
                variant="outlined"
                color="primary"
                startIcon={<LocalPhoneIcon />}
                onClick={() => handleEmergencyCall(contact)}
                sx={{ width: '100%' }}
              >
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography variant="button" display="block">
                    {contact.name}: {contact.number}
                  </Typography>
                  {contact.description && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {contact.description}
                    </Typography>
                  )}
                </Box>
              </Button>
            ))}
          </Box>
        </Collapse>

        {user && (
          <Button
            variant="contained"
            color="error"
            startIcon={<WarningIcon />}
            onClick={handleEmergencyContact}
            sx={{
              mt: 3,
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
              background: 'linear-gradient(145deg, #c62828 0%, #7f0000 100%)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
                background: 'linear-gradient(145deg, #d32f2f 0%, #9a0007 100%)'
              }
            }}
          >
            Send Location to Emergency Contact
          </Button>
        )}
      </Box>

      {/* Map Section */}
      <Box 
        id="map" 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
          },
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'linear-gradient(145deg, #1a1d22 0%, #13161c 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: 'primary.main',
            fontWeight: 700,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontFamily: '"Poppins", sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              color: 'primary.light',
              textShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
          }}
        >
          <LocalHospitalIcon /> Nearby Emergency Services
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<LocalHospitalIcon />}
          endIcon={<DirectionsIcon />}
          onClick={showNearestHospital}
          disabled={!medicalFacilities.some(f => f.type === 'hospital')}
          sx={{ 
            mb: 2, 
            width: '100%',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
            },
            background: 'linear-gradient(145deg, #c62828 0%, #7f0000 100%)',
            '&:disabled': {
              background: 'linear-gradient(145deg, #424242 0%, #212121 100%)',
              opacity: 0.6,
            }
          }}
        >
          Find Nearest Hospital
        </Button>

        {location.accuracy && (
          <Alert 
            severity={location.accuracy <= 50 ? "success" : location.accuracy <= 100 ? "warning" : "error"} 
            sx={{ mb: 2 }}
          >
            Location Accuracy: ±{Math.round(location.accuracy)} meters
            {location.accuracy > 100 && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                For better accuracy, please ensure GPS is enabled and you have a clear view of the sky
              </Typography>
            )}
          </Alert>
        )}

        <MapContainer
          center={[location.lat, location.lng]}
          zoom={mapSettings.zoom}
          minZoom={mapSettings.minZoom}
          maxZoom={mapSettings.maxZoom}
          zoomControl={false}
          style={mapContainerStyle}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
        >
          <MapController nearest={nearestHospital} />
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.lat, location.lng]} icon={icons.user}>
            <Popup>
              Your Location
              {location.city && <><br />{location.city}</>}
              {location.country && <>, {location.country}</>}
              {location.accuracy && (
                <><br />Accuracy: ±{Math.round(location.accuracy)}m</>
              )}
            </Popup>
          </Marker>
          {location.accuracy && (
            <Circle
              center={[location.lat, location.lng]}
              radius={location.accuracy}
              pathOptions={{
                color: '#2196f3',
                fillColor: '#2196f3',
                fillOpacity: 0.1
              }}
            />
          )}
          {medicalFacilities.map((facility) => (
            <Marker
              key={facility.id}
              position={[facility.location.lat, facility.location.lng]}
              icon={facility.emergency ? icons.emergency : icons[facility.amenity as keyof typeof icons] || icons.default}
            >
              <Popup>
                <Typography variant="subtitle2">{facility.name}</Typography>
                {facility.emergency && (
                  <Chip
                    label="Emergency"
                    color="error"
                    size="small"
                    sx={{ my: 0.5 }}
                  />
                )}
                {facility.distance && (
                  <Typography variant="body2" color="text.secondary">
                    Distance: {facility.distance} km
                  </Typography>
                )}
                {facility.address && (
                  <Typography variant="body2">
                    {facility.address}
                  </Typography>
                )}
                {facility.phone && (
                  <Typography variant="body2">
                    Phone: {facility.phone}
                  </Typography>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Emergency Number Dialog */}
      <Dialog 
        open={!!selectedContact} 
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #1a1d22 0%, #13161c 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 14px 50px rgba(0,0,0,0.6)',
            },
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: (theme) => 
              selectedContact?.type === 'police' 
                ? 'linear-gradient(145deg, #0d2661 0%, #051c4e 100%)'
                : selectedContact?.type === 'hospital'
                ? 'linear-gradient(145deg, #a01c1c 0%, #6b0000 100%)'
                : 'linear-gradient(145deg, #a63603 0%, #7a2000 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2,
            px: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: (theme) => 
                selectedContact?.type === 'police' 
                  ? 'linear-gradient(145deg, #163385 0%, #0a2465 100%)'
                : selectedContact?.type === 'hospital'
                ? 'linear-gradient(145deg, #c72c2c 0%, #8b0000 100%)'
                : 'linear-gradient(145deg, #c44104 0%, #982800 100%)',
            },
          }}
        >
          <LocalPhoneIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedContact?.name}
          </Typography>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            py: 4,
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              background: 'rgba(30, 35, 45, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                background: 'rgba(35, 40, 50, 0.6)',
              },
            }}
          >
            <Typography 
              variant="h2" 
              component="div" 
              align="center" 
              sx={{ 
                fontWeight: 'bold',
                color: selectedContact?.type === 'police' ? 'primary.main' : 
                       selectedContact?.type === 'hospital' ? 'error.main' : 
                       'warning.main',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              {selectedContact?.number}
            </Typography>
          </Box>
          {selectedContact?.description && (
            <Typography 
              variant="body1" 
              color="text.secondary" 
              align="center" 
              sx={{ 
                mt: 1,
                maxWidth: '80%',
                lineHeight: 1.6,
              }}
            >
              {selectedContact.description}
            </Typography>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 2,
            px: 3,
            pb: 3,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              transition: 'all 0.2s ease',
              borderColor: (theme) => 
                selectedContact?.type === 'police' ? 'primary.main' : 
                selectedContact?.type === 'hospital' ? 'error.main' : 
                'warning.main',
              color: (theme) => 
                selectedContact?.type === 'police' ? 'primary.main' : 
                selectedContact?.type === 'hospital' ? 'error.main' : 
                'warning.main',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 1,
                borderColor: (theme) => 
                  selectedContact?.type === 'police' ? 'primary.light' : 
                  selectedContact?.type === 'hospital' ? 'error.light' : 
                  'warning.light',
                bgcolor: (theme) => 
                  selectedContact?.type === 'police' ? alpha(theme.palette.primary.main, 0.1) : 
                  selectedContact?.type === 'hospital' ? alpha(theme.palette.error.main, 0.1) : 
                  alpha(theme.palette.warning.main, 0.1),
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Only Dialog */}
      <Dialog 
        open={showMobileOnlyDialog} 
        onClose={handleCloseMobileOnlyDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #1a1d22 0%, #13161c 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(145deg, #a01c1c 0%, #6b0000 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2,
            px: 3,
          }}
        >
          <WarningIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Mobile Feature Only
          </Typography>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            py: 4,
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ color: 'error.main', mb: 2 }}>
            📱
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            This feature is only available on mobile devices
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            To share your location with emergency contacts, please use our mobile app or access this website from your mobile device.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This ensures accurate location sharing and immediate emergency response.
          </Typography>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 2,
            px: 3,
            pb: 3,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button 
            onClick={handleCloseMobileOnlyDialog} 
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            top: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: '90%',
            width: '400px',
            boxShadow: 3
          }}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default EmergencyMap; 