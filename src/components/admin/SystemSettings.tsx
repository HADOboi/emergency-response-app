import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Divider,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  TextField,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface SettingsState {
  enableNotifications: boolean;
  enableLocationServices: boolean;
  enableDataCollection: boolean;
  sessionTimeout: number;
  apiEndpoint: string;
}

const SystemSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initial settings state (would normally be fetched from backend)
  const [settings, setSettings] = useState<SettingsState>({
    enableNotifications: true,
    enableLocationServices: true,
    enableDataCollection: false,
    sessionTimeout: 30,
    apiEndpoint: 'http://localhost:5000',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSettings({
      ...settings,
      [name]: parseInt(value) || 0,
    });
  };

  const handleSaveSettings = async () => {
    // This would normally save to backend
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      
      // Success
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <SettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            System Settings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              ml: 'auto', 
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif',
              textTransform: 'none',
            }}
            onClick={() => navigate('/admin')}
          >
            Back to Dashboard
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: '"Poppins", sans-serif', 
                  fontWeight: 600 
                }}
              >
                Application Configuration
              </Typography>
              <Chip 
                label="Core Settings" 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }} 
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {/* Notification Settings */}
              <Grid item xs={12} md={4}>
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
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <NotificationsIcon color="primary" />
                      <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                        Notifications
                      </Typography>
                    </Stack>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableNotifications}
                          onChange={handleChange}
                          name="enableNotifications"
                          color="primary"
                        />
                      }
                      label="Enable Notifications"
                      sx={{ mb: 2, width: '100%' }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Control system-wide notification settings for all users.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Location Services */}
              <Grid item xs={12} md={4}>
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
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <SecurityIcon color="primary" />
                      <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                        Location Services
                      </Typography>
                    </Stack>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableLocationServices}
                          onChange={handleChange}
                          name="enableLocationServices"
                          color="primary"
                        />
                      }
                      label="Enable Location Services"
                      sx={{ mb: 2, width: '100%' }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Control location tracking settings for emergency response.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Data Collection */}
              <Grid item xs={12} md={4}>
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
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <StorageIcon color="primary" />
                      <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                        Data Collection
                      </Typography>
                    </Stack>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableDataCollection}
                          onChange={handleChange}
                          name="enableDataCollection"
                          color="primary"
                        />
                      }
                      label="Enable Analytics"
                      sx={{ mb: 2, width: '100%' }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Control usage data collection for system improvements.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Advanced Settings */}
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
                      Advanced Settings
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Session Timeout (minutes)"
                          name="sessionTimeout"
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={handleNumberChange}
                          variant="outlined"
                          sx={{ mb: 3 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="API Endpoint"
                          name="apiEndpoint"
                          value={settings.apiEndpoint}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{ mb: 3 }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
                onClick={handleSaveSettings}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SystemSettings; 