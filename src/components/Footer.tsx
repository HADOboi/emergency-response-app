import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              © {new Date().getFullYear()} Emergency Response App - ERA. All rights reserved.
            </Typography>
            <Link
              href="mailto:tc22.2886@gmail.com"
              color="inherit"
              underline="hover"
              sx={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'all 0.3s ease',
                px: 2,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <EmailIcon fontSize="small" />
              Contact Us
            </Link>
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Version 3.0.0
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              ERA - Made with ❤️ for public safety
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 