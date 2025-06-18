import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Avatar,
  Grid,
  MenuItem,
  Alert,
  IconButton,
  CircularProgress
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: '',
    programme: '',
    branch: '',
    year: '',
    semester: '',
    phoneNo: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/${userInfo.id}`);
        setUser({
          name: response.data.name || '',
          programme: response.data.programme || '',
          branch: response.data.branch || '',
          year: response.data.year || '',
          semester: response.data.semester || '',
          phoneNo: response.data.phoneNo || ''
        });

        // Check if user has a profile image
        if (response.data.hasProfileImage) {
          setPreviewImage(`http://localhost:8080/api/users/${userInfo.id}/profile-image`);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const formData = new FormData();
      const userBlob = new Blob([JSON.stringify(user)], { type: 'application/json' });
      formData.append('user', userBlob);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      await axios.put(`http://localhost:8080/api/users/${userInfo.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Profile updated successfully');
      setLoading(false);
    } catch (err) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper 
        elevation={6} 
        sx={{ 
          marginTop: 4, 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
          Your Profile
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            src={previewImage} 
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 2,
              bgcolor: 'primary.light'
            }}
          >
            {!previewImage && <PersonIcon sx={{ fontSize: 60 }} />}
          </Avatar>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="profile-image-upload">
            <Button 
              variant="outlined" 
              component="span"
              startIcon={<PhotoCameraIcon />}
            >
              Change Photo
            </Button>
          </label>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="programme"
                label="Programme"
                name="programme"
                value={user.programme}
                onChange={handleChange}
                placeholder="e.g. B.Tech, M.Tech"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="branch"
                label="Branch"
                name="branch"
                value={user.branch}
                onChange={handleChange}
                placeholder="e.g. Computer Science, Electrical"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="year"
                label="Year"
                name="year"
                value={user.year}
                onChange={handleChange}
                placeholder="Enter your year"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="semester"
                label="Semester"
                name="semester"
                value={user.semester}
                onChange={handleChange}
                placeholder="Enter your semester"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phoneNo"
                label="Phone Number"
                name="phoneNo"
                value={user.phoneNo}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 4, mb: 2, py: 1.5 }}
          >
            Save Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile; 