import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Container,
  Paper,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Gavel as GavelIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import UnaddedLegalTerms from '../UnaddedLegalTerms';

interface DashboardStats {
  totalUsers: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load dashboard stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <DashboardIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>

        <Paper 
          elevation={2} 
          sx={{ 
            mb: 4, 
            borderRadius: 3, 
            overflow: 'hidden',
            backgroundImage: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'linear-gradient(to right bottom, #1e293b, #111827)' 
                : 'linear-gradient(to right bottom, #f8fafc, #e2e8f0)',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PeopleIcon color="primary" />
                      <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                        Total Users
                      </Typography>
                      <Chip 
                        label="Active" 
                        size="small" 
                        color="success" 
                        sx={{ ml: 'auto' }} 
                      />
                    </Stack>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                        {stats?.totalUsers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        registered users
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<PeopleIcon />}
                      onClick={() => navigate('/admin/users')}
                      sx={{ 
                        fontFamily: '"Poppins", sans-serif',
                        borderRadius: 2,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                    >
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <SettingsIcon color="primary" />
                      <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                        System Settings
                      </Typography>
                    </Stack>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Configure system settings, manage permissions and control application features.
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<SettingsIcon />}
                      onClick={() => navigate('/admin/settings')}
                      sx={{ 
                        fontFamily: '"Poppins", sans-serif',
                        borderRadius: 2,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Manage Settings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ px: 3, pt: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  minHeight: 60,
                  fontSize: '1rem',
                },
                '& .Mui-selected': {
                  fontWeight: 600,
                },
              }}
            >
              <Tab 
                icon={<GavelIcon />} 
                label="Unadded Legal Terms" 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 0 }}>
            {activeTab === 0 && <UnaddedLegalTerms />}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 