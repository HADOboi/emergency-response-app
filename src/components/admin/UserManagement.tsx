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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Container,
  Divider,
  Chip,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh users list
      fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <PeopleIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            User Management
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
                System Users
              </Typography>
              <Chip 
                label={`${users.length} users`} 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }} 
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                boxShadow: 3,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.02)' 
                  }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Joined Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow 
                        key={userItem._id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: (theme) => 
                              theme.palette.mode === 'dark' 
                                ? 'rgba(255,255,255,0.05)' 
                                : 'rgba(0,0,0,0.02)'
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>{userItem.name}</TableCell>
                        <TableCell sx={{ py: 2 }}>{userItem.email}</TableCell>
                        <TableCell sx={{ py: 2 }}>{new Date(userItem.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ py: 2 }} align="right">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(userItem)}
                            disabled={userItem.email === 'admin@erapp.com'} // Prevent deleting admin
                            sx={{
                              opacity: userItem.email === 'admin@erapp.com' ? 0.5 : 1,
                              '&:hover': {
                                bgcolor: 'rgba(211, 47, 47, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Paper>

        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 24,
            }
          }}
        >
          <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
            Delete User
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
            {selectedUser && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  User Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedUser.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 2,
              }}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default UserManagement; 