import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Button,
  alpha,
  Container,
  ListItemIcon
} from '@mui/material';
import { useEmergency } from '../context/EmergencyContext';
import { useUser } from '../context/UserContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface HeaderProps {
  onNavClick: (sectionId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { location } = useEmergency();
  const { user, logout } = useUser();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  // Close profile menu when user state changes (after login)
  useEffect(() => {
    setProfileMenuAnchor(null);
  }, [user]);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const handleNavItemClick = (sectionId: string) => {
    handleMobileMenuClose();
    onNavClick(sectionId);
  };

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={1}
      sx={{
        background: (theme) => 
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              letterSpacing: '0.5px',
              color: 'primary.main',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: '"Poppins", sans-serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                color: 'primary.light',
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
              },
            }}
            onClick={() => {
              onNavClick('home');
              navigate('/');
            }}
          >
            Emergency Response App <span style={{ fontSize: '0.8em', color: 'gray' }}>ERA</span>
          </Typography>

          {/* Navigation Menu */}
          {isMobile ? (
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
              >
                <MenuItem onClick={() => handleNavItemClick('search')}>Search</MenuItem>
                <MenuItem onClick={() => handleNavItemClick('emergency-buttons')}>Emergency Services</MenuItem>
                <MenuItem onClick={() => handleNavItemClick('map')}>Map</MenuItem>
                {user ? (
                  <>
                    <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                    {user.role === 'admin' && (
                      <MenuItem onClick={() => {
                        setMobileMenuAnchor(null);
                        navigate('/admin');
                      }}>Admin Dashboard</MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </>
                ) : (
                  <MenuItem onClick={() => navigate('/login')}>Login</MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                color="inherit"
                onClick={() => handleNavItemClick('search')}
                startIcon={<SearchIcon />}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                Search
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavItemClick('map')}
                startIcon={<MapIcon />}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                Map
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavItemClick('emergency-buttons')}
                startIcon={<LocalHospitalIcon />}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                Emergency Services
              </Button>
              {user ? (
                <>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileMenuOpen(e);
                    }}
                    color="inherit"
                    size="small"
                  >
                    <PersonIcon />
                  </IconButton>
                  <Menu
                    id="profile-menu"
                    anchorEl={profileMenuAnchor}
                    open={Boolean(profileMenuAnchor)}
                    onClose={() => setProfileMenuAnchor(null)}
                    MenuListProps={{
                      'aria-labelledby': 'profile-button',
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1.5,
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          minWidth: 180,
                        }
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={handleProfileClick}
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Profile
                    </MenuItem>
                    {user.role === 'admin' && (
                      <MenuItem 
                        onClick={() => {
                          setProfileMenuAnchor(null);
                          navigate('/admin');
                        }}
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      <LogoutIcon sx={{ mr: 1 }} /> Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => navigate('/login')}
                  startIcon={<LoginIcon />}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </AppBar>
  );
};

export default Header; 