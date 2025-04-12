import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Show success dialog
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate('/login');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 'sm',
        mx: 'auto',
        marginTop: 8,
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        borderRadius: 3,
        background: (theme) => 
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(40, 40, 45, 0.9) 0%, rgba(25, 25, 30, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(245, 245, 250, 0.9) 0%, rgba(230, 230, 235, 0.9) 100%)',
        backdropFilter: 'blur(8px)',
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        transition: 'all 0.3s ease-in-out',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <Typography 
        component="h1" 
        variant="h5" 
        sx={{ 
          mb: 3,
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 700,
          fontSize: { xs: '1.8rem', sm: '2.2rem' },
          letterSpacing: '0.5px',
          color: 'primary.main',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        Sign Up
      </Typography>
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Full Name"
          name="name"
          autoComplete="name"
          autoFocus
          value={formData.name}
          onChange={handleChange}
          sx={{
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
            '& input:-webkit-autofill': {
              WebkitBoxShadow: (theme) => 
                theme.palette.mode === 'dark' 
                  ? '0 0 0 1000px rgba(40, 40, 45, 0.9) inset' 
                  : '0 0 0 1000px rgba(245, 245, 250, 0.5) inset',
              WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
              caretColor: (theme) => theme.palette.primary.main,
              borderRadius: 'inherit',
              WebkitBackgroundClip: 'text',
            }
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          sx={{
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
            '& input:-webkit-autofill': {
              WebkitBoxShadow: (theme) => 
                theme.palette.mode === 'dark' 
                  ? '0 0 0 1000px rgba(40, 40, 45, 0.9) inset' 
                  : '0 0 0 1000px rgba(245, 245, 250, 0.5) inset',
              WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
              caretColor: (theme) => theme.palette.primary.main,
              borderRadius: 'inherit',
              WebkitBackgroundClip: 'text',
            }
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          sx={{
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
            '& input:-webkit-autofill': {
              WebkitBoxShadow: (theme) => 
                theme.palette.mode === 'dark' 
                  ? '0 0 0 1000px rgba(40, 40, 45, 0.9) inset' 
                  : '0 0 0 1000px rgba(245, 245, 250, 0.5) inset',
              WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
              caretColor: (theme) => theme.palette.primary.main,
              borderRadius: 'inherit',
              WebkitBackgroundClip: 'text',
            }
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          sx={{
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
            '& input:-webkit-autofill': {
              WebkitBoxShadow: (theme) => 
                theme.palette.mode === 'dark' 
                  ? '0 0 0 1000px rgba(40, 40, 45, 0.9) inset' 
                  : '0 0 0 1000px rgba(245, 245, 250, 0.5) inset',
              WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
              caretColor: (theme) => theme.palette.primary.main,
              borderRadius: 'inherit',
              WebkitBackgroundClip: 'text',
            }
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ 
            mt: 3, 
            mb: 2,
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '1.1rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 2,
            }
          }}
        >
          Sign Up
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            Already have an account? Sign In
          </Link>
        </Box>
      </form>

      {/* Success Dialog */}
      <Dialog 
        open={showSuccessDialog} 
        onClose={handleCloseSuccessDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            background: (theme) => 
              theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(145deg, #4CAF50 0%, #388E3C 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2,
            px: 3,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registration Successful
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
          <Typography variant="h4" sx={{ color: 'success.main', mb: 2 }}>
            🎉
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome to Emergency Response!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your account has been created successfully. Please login to continue.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will be redirected to the login page.
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
            onClick={handleCloseSuccessDialog} 
            variant="contained"
            color="success"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          >
            Continue to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Signup; 