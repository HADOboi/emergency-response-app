import { LegalSearchResult, LegalSection, UnaddedLegalTerm } from '../types';
import { legalDatabase } from '../data/legalData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Function to get legal sections from API first, falling back to local database
const getLegalSections = async (): Promise<LegalSection[]> => {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/legal/sections`);
    
    if (response.ok) {
      const apiSections = await response.json();
      if (Array.isArray(apiSections) && apiSections.length > 0) {
        console.log('Using API legal sections:', apiSections.length);
        return apiSections;
      }
    }
  } catch (error) {
    console.warn('Error fetching legal sections from API, falling back to local data:', error);
  }
  
  // Fallback to local database
  console.log('Using local legal database');
  return legalDatabase;
};

export const searchLegalInformation = async (query: string, shouldTrackUnadded: boolean = false): Promise<LegalSearchResult> => {
  try {
    const searchQuery = query.toLowerCase();
    
    // Get legal sections from API first, fallback to local database
    const legalSections = await getLegalSections();
    
    // Find matching sections
    const matchingSections = legalSections.filter(section =>
      section.keywords.some(keyword => 
        typeof keyword === 'string' && keyword.toLowerCase().includes(searchQuery)
      ) ||
      section.title.toLowerCase().includes(searchQuery) ||
      section.description.toLowerCase().includes(searchQuery)
    );

    // Track unadded term if requested - regardless of matches
    // This ensures terms are tracked to improve the database
    if (shouldTrackUnadded) {
      try {
        console.log('Attempting to track search term:', searchQuery);
        
        const response = await fetch(`${API_BASE_URL}/api/legal/unadded-terms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ term: searchQuery }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to track search term:', errorData.message || response.statusText);
        } else {
          const data = await response.json();
          console.log('Successfully tracked search term:', data);
        }
      } catch (error) {
        console.error('Error tracking search term:', error);
      }
    }

    if (matchingSections.length === 0) {
      throw new Error('No matching legal information found');
    }

    // Generate summary based on the first matching section
    const summary = `Based on your search for "${query}", here are the relevant legal provisions under Indian law.`;

    // Get emergency actions from the first matching section
    const emergencyActions = matchingSections[0]?.emergencyActions || [
      'Call emergency services (100) immediately',
      'Do not disturb the crime scene',
      'Contact the nearest police station',
      'Seek medical attention if needed'
    ];

    // Get related laws based on the category of the crime
    const relatedLaws = [...new Set(matchingSections.map(section => section.category))];

    return {
      sections: matchingSections,
      summary,
      emergencyActions,
      relatedLaws
    };
  } catch (error) {
    console.error('Error searching legal information:', error);
    throw error;
  }
}; 