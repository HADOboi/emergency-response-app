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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token
      }));

      // Update user context
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token
      });

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
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
        Login
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
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
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
          autoComplete="current-password"
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
          Sign In
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/signup')}
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            Don't have an account? Sign Up
          </Link>
        </Box>
      </form>
    </Paper>
  );
};

export default Login; 