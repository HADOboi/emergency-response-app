import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  bloodGroup: string;
  address: string;
  allergies: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

const Profile: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    bloodGroup: '',
    address: '',
    allergies: '',
    emergencyContact: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfileData({
          bloodGroup: data.bloodGroup || '',
          address: data.address || '',
          allergies: data.allergies || '',
          emergencyContact: data.emergencyContact || {
            name: '',
            phone: '',
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
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
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'linear-gradient(145deg, #1a1d22 0%, #13161c 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            color: 'primary.main',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Profile Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: '1.2rem',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 2,
                  '&:hover': {
                    color: 'primary.light',
                    textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={user.name}
                disabled
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& .MuiInputBase-root': {
                    fontFamily: '"Inter", sans-serif',
                    color: (theme) => theme.palette.mode === 'light' ? theme.palette.text.primary : 'inherit',
                    backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(245, 247, 250, 0.7)' : 'transparent',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: (theme) => theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                disabled
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& .MuiInputBase-root': {
                    fontFamily: '"Inter", sans-serif',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Blood Group"
                name="bloodGroup"
                value={profileData.bloodGroup}
                onChange={handleChange}
                placeholder="e.g., A+, B-, O+"
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& .MuiInputBase-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? '0 0 0 1000px rgba(26, 29, 34, 0.9) inset' 
                        : '0 0 0 1000px rgba(42, 47, 56, 0.5) inset',
                    WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                    caretColor: (theme) => theme.palette.primary.main,
                    borderRadius: 'inherit',
                    WebkitBackgroundClip: 'text',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Your complete address"
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& .MuiInputBase-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? '0 0 0 1000px rgba(26, 29, 34, 0.9) inset' 
                        : '0 0 0 1000px rgba(42, 47, 56, 0.5) inset',
                    WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                    caretColor: (theme) => theme.palette.primary.main,
                    borderRadius: 'inherit',
                    WebkitBackgroundClip: 'text',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allergies"
                name="allergies"
                value={profileData.allergies}
                onChange={handleChange}
                placeholder="e.g., Penicillin, Peanuts, etc."
                multiline
                rows={2}
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& .MuiInputBase-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? '0 0 0 1000px rgba(26, 29, 34, 0.9) inset' 
                        : '0 0 0 1000px rgba(42, 47, 56, 0.5) inset',
                    WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                    caretColor: (theme) => theme.palette.primary.main,
                    borderRadius: 'inherit',
                    WebkitBackgroundClip: 'text',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: '1.2rem',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 3,
                  '&:hover': {
                    color: 'primary.light',
                    textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Emergency Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Name"
                name="emergencyContact.name"
                value={profileData.emergencyContact.name}
                onChange={handleChange}
                placeholder="Full name of your emergency contact"
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& .MuiInputBase-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? '0 0 0 1000px rgba(26, 29, 34, 0.9) inset' 
                        : '0 0 0 1000px rgba(42, 47, 56, 0.5) inset',
                    WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                    caretColor: (theme) => theme.palette.primary.main,
                    borderRadius: 'inherit',
                    WebkitBackgroundClip: 'text',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="emergencyContact.phone"
                value={profileData.emergencyContact.phone}
                onChange={handleChange}
                placeholder="Phone number with country code"
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& .MuiInputBase-root': {
                    fontFamily: '"Inter", sans-serif',
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? '0 0 0 1000px rgba(26, 29, 34, 0.9) inset' 
                        : '0 0 0 1000px rgba(42, 47, 56, 0.5) inset',
                    WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                    caretColor: (theme) => theme.palette.primary.main,
                    borderRadius: 'inherit',
                    WebkitBackgroundClip: 'text',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={saving}
                sx={{ 
                  mt: 3, 
                  py: 1.5, 
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                  background: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? 'linear-gradient(145deg, #0d47a1 0%, #0a3880 100%)'
                      : 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
                    background: (theme) => 
                      theme.palette.mode === 'dark' 
                        ? 'linear-gradient(145deg, #1565c0 0%, #0d47a1 100%)'
                        : 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile; 