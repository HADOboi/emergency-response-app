import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import { UserProvider } from './context/UserContext';
import { EmergencyProvider } from './context/EmergencyContext';
import Header from './components/Header';
import EmergencyMap from './components/EmergencyMap';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Profile from './components/Profile';
import Footer from './components/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SystemSettings from './components/admin/SystemSettings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { IconButton, Tooltip } from '@mui/material';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1565c0' : '#1976d2',
        light: mode === 'light' ? '#5e92f3' : '#4791db',
        dark: mode === 'light' ? '#003c8f' : '#115293',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? '#c2185b' : '#dc004e',
        light: mode === 'light' ? '#fa5788' : '#e33371',
        dark: mode === 'light' ? '#8c0032' : '#9a0036',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#263238' : '#ffffff',
        secondary: mode === 'light' ? '#546e7a' : '#b0bec5',
      },
      error: {
        main: mode === 'light' ? '#d32f2f' : '#f44336',
      },
      warning: {
        main: mode === 'light' ? '#ed6c02' : '#ff9800',
      },
      info: {
        main: mode === 'light' ? '#0288d1' : '#2196f3',
      },
      success: {
        main: mode === 'light' ? '#2e7d32' : '#4caf50',
      },
    },
    typography: {
      fontFamily: '"Inter", "Poppins", system-ui, Avenir, Helvetica, Arial, sans-serif',
      h1: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
      },
      h3: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
      },
      h5: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
      },
      button: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
        textTransform: 'none',
      },
      body1: {
        fontFamily: '"Inter", sans-serif',
      },
      body2: {
        fontFamily: '"Inter", sans-serif',
      },
      subtitle1: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
      },
      subtitle2: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
      },
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <EmergencyProvider>
          <Router>
            <Header onNavClick={handleNavClick} />
            <Container maxWidth="lg" sx={{ 
              py: 4, 
              flex: 1, 
              position: 'relative', 
              zIndex: 1,
              '& > *': {
                backgroundColor: mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(40, 40, 45, 0.9) 0%, rgba(25, 25, 30, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 248, 255, 0.95) 100%)',
                borderRadius: 3,
                border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              },
            }}>
              <Routes>
                <Route path="/" element={<EmergencyMap />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <UserManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRoute>
                      <SystemSettings />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Container>
            <Footer />
            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                  bgcolor: mode === 'dark' 
                    ? 'rgba(30, 30, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1) rotate(180deg)',
                    bgcolor: mode === 'dark'
                      ? 'rgba(30, 30, 30, 0.9)'
                      : 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  },
                  border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Router>
        </EmergencyProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App; 