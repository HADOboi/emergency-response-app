import { MedicalFacility, Location } from '../types';

const SEARCH_RADIUS = 30000; // 30km radius

export async function fetchNearbyMedicalFacilities(location: Location): Promise<MedicalFacility[]> {
  try {
    // Overpass API query to find medical facilities, police stations, and fire stations
    const query = `
      [out:json][timeout:25];
      (
        // Medical facilities
        node["amenity"="hospital"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        way["amenity"="hospital"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        node["amenity"="clinic"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        way["amenity"="clinic"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        node["healthcare"="hospital"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        way["healthcare"="hospital"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        
        // Police stations
        node["amenity"="police"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        way["amenity"="police"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        
        // Fire stations
        node["amenity"="fire_station"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
        way["amenity"="fire_station"](around:${SEARCH_RADIUS},${location.lat},${location.lng});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });

    const data = await response.json();
    
    // Process and format the results
    const facilities: MedicalFacility[] = data.elements
      .filter((element: any) => element.tags && (
        element.tags.amenity === 'hospital' ||
        element.tags.amenity === 'clinic' ||
        element.tags.healthcare === 'hospital' ||
        element.tags.amenity === 'police' ||
        element.tags.amenity === 'fire_station'
      ))
      .map((element: any) => {
        const lat = element.lat || (element.center && element.center.lat);
        const lng = element.lon || (element.center && element.center.lon);
        
        if (!lat || !lng) return null;

        // Calculate distance from user's location
        const distance = calculateDistance(
          location.lat,
          location.lng,
          lat,
          lng
        );

        // Determine the type of facility
        let type = 'default';
        if (element.tags.amenity === 'police') type = 'police';
        else if (element.tags.amenity === 'fire_station') type = 'fire';
        else if (element.tags.amenity === 'hospital' || element.tags.healthcare === 'hospital') type = 'hospital';
        else if (element.tags.amenity === 'clinic') type = 'clinic';

        return {
          id: element.id.toString(),
          name: element.tags.name || `Unnamed ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          location: {
            lat,
            lng
          },
          type,
          amenity: element.tags.amenity || element.tags.healthcare,
          address: element.tags['addr:full'] || element.tags['addr:street'],
          phone: element.tags.phone || element.tags['contact:phone'],
          emergency: element.tags.emergency === 'yes',
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
        };
      })
      .filter((facility: MedicalFacility | null): facility is MedicalFacility => 
        facility !== null && facility.location.lat !== undefined
      )
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return facilities;
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }
}

// Calculate distance between two points in kilometers using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 