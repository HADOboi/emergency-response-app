import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import BlockIcon from '@mui/icons-material/Block';
import { UnaddedLegalTerm } from '../types';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { legalDatabase } from '../data/legalData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UnaddedLegalTerms: React.FC = () => {
  const [terms, setTerms] = useState<UnaddedLegalTerm[]>([]);
  const [existingCases, setExistingCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<UnaddedLegalTerm | null>(null);
  const [selectedExistingCase, setSelectedExistingCase] = useState<string>('');
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchExistingCases = async () => {
    try {
      setExistingCases(legalDatabase.map(section => ({
        _id: section.id,
        title: `${section.code} - ${section.title}`,
        category: section.category
      })));
    } catch (err) {
      console.error('Error setting existing cases:', err);
      setError('Failed to load existing cases');
    }
  };

  const fetchTerms = async () => {
    try {
      if (!user?.token) {
        setError('Please log in to view unadded terms');
        setLoading(false);
        return;
      }

      console.log('Fetching unadded terms...');
      
      const response = await fetch(`${API_BASE_URL}/api/legal/unadded-terms`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.status === 401) {
        setError('Please log in to view unadded terms');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch unadded terms: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched unadded terms:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data, data);
        throw new Error('Invalid data format received from server');
      }
      
      setTerms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load unadded terms';
      setError(errorMessage);
      console.error('Error fetching unadded terms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
    fetchExistingCases();
  }, [user?.token]);

  const handleIgnoreTerm = async (term: UnaddedLegalTerm) => {
    try {
      if (!user?.token) {
        setError('Please log in to ignore terms');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/legal/unadded-terms/${term._id}/ignore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.status === 401) {
        setError('Please log in to ignore terms');
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to ignore term');
      }
      
      // Refresh the list
      fetchTerms();
    } catch (err) {
      console.error('Error ignoring term:', err);
      setError('Failed to ignore term');
    }
  };

  const handleLinkClick = async (term: UnaddedLegalTerm) => {
    setSelectedTerm(term);
    setLinkDialogOpen(true);
    // Fetch existing cases when opening the dialog
    await fetchExistingCases();
  };

  const handleLinkTerm = async () => {
    if (!selectedTerm || !selectedExistingCase) return;

    try {
      if (!user?.token) {
        setError('Please log in to link terms');
        navigate('/login');
        return;
      }

      // Find the selected section from legalDatabase to get both id and _id
      const selectedSection = legalDatabase.find(section => section.id === selectedExistingCase);
      if (!selectedSection) {
        setError('Selected case not found in database');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/legal/unadded-terms/${selectedTerm._id}/link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          existingCaseId: selectedExistingCase,
          caseTitle: selectedSection.title
        })
      });

      if (response.status === 401) {
        setError('Please log in to link terms');
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to link term');
      }
      
      // Close dialog and refresh list
      setLinkDialogOpen(false);
      setSelectedTerm(null);
      setSelectedExistingCase('');
      fetchTerms();
    } catch (err) {
      console.error('Error linking term:', err);
      setError(err instanceof Error ? err.message : 'Failed to link term');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Term</TableCell>
              <TableCell align="right">Search Count</TableCell>
              <TableCell align="right">Last Searched</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {terms.map((term) => (
              <TableRow key={term._id}>
                <TableCell component="th" scope="row">
                  {term.term}
                </TableCell>
                <TableCell align="right">{term.searchCount}</TableCell>
                <TableCell align="right">
                  {new Date(term.lastSearched).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Link to Existing Case">
                      <IconButton
                        color="info"
                        onClick={() => handleLinkClick(term)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'info.light',
                            color: 'white',
                          },
                        }}
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ignore Term">
                      <IconButton
                        color="error"
                        onClick={() => handleIgnoreTerm(term)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white',
                          },
                        }}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {terms.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No unadded terms found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This means all legal terms searched by users have been added to the database.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
        <DialogTitle>Link to Existing Case</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Existing Case</InputLabel>
            <Select
              value={selectedExistingCase}
              onChange={(e) => setSelectedExistingCase(e.target.value)}
              label="Select Existing Case"
            >
              {existingCases && existingCases.length > 0 ? (
                existingCases.map((case_) => (
                  <MenuItem key={case_._id} value={case_._id}>
                    {case_.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No existing cases found</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setLinkDialogOpen(false);
            setSelectedExistingCase('');
          }}>Cancel</Button>
          <Button 
            onClick={handleLinkTerm} 
            variant="contained" 
            color="primary"
            disabled={!selectedExistingCase}
          >
            Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnaddedLegalTerms; 