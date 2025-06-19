import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email) return false;
    
    // Check if email ends with @am.students.amrita.edu
    if (!email.endsWith('@am.students.amrita.edu')) {
      setEmailError('Only @am.students.amrita.edu email addresses are allowed');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email domain
    if (!validateEmail(email)) {
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirect to products page
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setEmailError('');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={6} 
        sx={{ 
          marginTop: 8, 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          GradGear Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={!!emailError}
          >
            Sign In
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/signup')}
            sx={{ mt: 1 }}
          >
            Don't have an account? Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 