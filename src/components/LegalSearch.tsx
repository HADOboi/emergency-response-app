import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Collapse,
  Link
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import { LegalSearchResult } from '../types';
import { searchLegalInformation } from '../services/legalSearch';

interface LegalSearchProps {
  isAvailable: boolean;
  onSearch: (query: string, shouldTrackUnadded?: boolean) => Promise<LegalSearchResult>;
  initialQuery?: string;
  onEmergencyActionClick?: (action: string) => void;
}

const LegalSearch: React.FC<LegalSearchProps> = ({ 
  isAvailable, 
  onSearch, 
  initialQuery = '',
  onEmergencyActionClick 
}) => {
  const [result, setResult] = useState<LegalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Reset expanded section when new search results come in
  useEffect(() => {
    setExpandedSection(null);
  }, [result]);

  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch(initialQuery, false);
    }
  }, [initialQuery]);

  const handleSearch = async (query: string, shouldTrackUnadded: boolean = false) => {
    if (!query.trim()) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchResult = await onSearch(query, shouldTrackUnadded);
      setResult(searchResult);
    } catch (err) {
      setError('Failed to search legal information. Please try again.');
      console.error('Legal search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyActionClick = (action: string) => {
    if (onEmergencyActionClick) {
      onEmergencyActionClick(action);
    }
  };

  const renderEmergencyAction = (action: string) => {
    // Define patterns to match and their corresponding emergency types
    const patterns = [
      { pattern: /call police/i, type: 'police' },
      { pattern: /call ambulance/i, type: 'hospital' },
      { pattern: /call hospital/i, type: 'hospital' },
      { pattern: /call women helpline/i, type: 'women' },
      { pattern: /call emergency services/i, type: 'hospital' },
      { pattern: /seek medical help/i, type: 'hospital' }
    ];

    for (const { pattern, type } of patterns) {
      if (pattern.test(action)) {
        const parts = action.split(pattern);
        return (
          <Box component="span">
            {parts[0]}
            <Link
              component="button"
              onClick={() => handleEmergencyActionClick(type)}
              sx={{
                color: 'error.main',
                textDecoration: 'underline',
                fontWeight: 'bold',
                '&:hover': { color: 'error.dark' }
              }}
            >
              {action.match(pattern)?.[0]}
            </Link>
            {parts[1]}
          </Box>
        );
      }
    }
    return action;
  };

  if (!isAvailable) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Legal search is currently only available for Indian citizens.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
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
        <GavelIcon />
        Legal Search Results
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle1" 
          paragraph
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
          }}
        >
          {result.summary}
        </Typography>
        
        {result.emergencyActions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              color="error" 
              gutterBottom
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              Emergency Actions:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {result.emergencyActions.map((action, idx) => (
                <Typography 
                  component="li" 
                  key={idx} 
                  variant="body2"
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 400,
                  }}
                >
                  {renderEmergencyAction(action)}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            fontSize: '1.1rem',
          }}
        >
          Relevant Legal Sections:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {result.sections.map((section) => (
            <Box 
              key={section.id} 
              sx={{ 
                border: '1px solid', 
                borderColor: expandedSection === section.id ? 'primary.main' : 'divider', 
                borderRadius: 1, 
                p: 2,
                transition: 'all 0.3s ease',
                boxShadow: expandedSection === section.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Button
                fullWidth
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                startIcon={<GavelIcon />}
                sx={{ 
                  justifyContent: 'flex-start', 
                  textAlign: 'left',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: expandedSection === section.id ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid currentColor',
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" component="div" fontWeight="medium">
                    {section.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.code} | Category: {section.category}
                  </Typography>
                </Box>
              </Button>
              <Collapse in={expandedSection === section.id}>
                <Box 
                  sx={{ 
                    mt: 2, 
                    pl: 4,
                    pb: 1,
                    borderLeft: '2px solid',
                    borderColor: 'primary.light',
                    ml: 1
                  }}
                >
                  <Typography variant="body2" paragraph>
                    {section.description}
                  </Typography>
                  {section.punishment && (
                    <>
                      <Typography 
                        variant="subtitle2" 
                        color="primary.dark" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600, 
                          mt: 2,
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            width: 8,
                            height: 8,
                            mr: 1,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            display: 'inline-block'
                          }
                        }}
                      >
                        Punishment:
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ fontWeight: 500 }}>
                        {section.punishment}
                      </Typography>
                    </>
                  )}
                  {section.relatedSections && section.relatedSections.length > 0 && (
                    <>
                      <Typography 
                        variant="subtitle2" 
                        color="primary.dark" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600, 
                          mt: 2,
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            width: 8,
                            height: 8,
                            mr: 1,
                            borderRadius: '50%',
                            bgcolor: 'info.main',
                            display: 'inline-block'
                          }
                        }}
                      >
                        Related Sections:
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ fontWeight: 500 }}>
                        {section.relatedSections.join(', ')}
                      </Typography>
                    </>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>

        {result.relatedLaws.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Related Laws: {result.relatedLaws.join(', ')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LegalSearch; 