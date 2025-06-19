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
  Avatar,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Signup = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const steps = ['Enter Email', 'Verify OTP', 'Create Account'];

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
  
  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup/initiate', { email });
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };
  
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup/verify-otp', { email, otp });
      setActiveStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    }
  };
  
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validatePassword()) {
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup/complete', {
        email,
        password,
        name
      });
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirect to products page
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
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
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleEmailSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
              helperText={emailError || "Please enter your Amrita email (@am.students.amrita.edu)"}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={!!emailError || !email}
            >
              Continue
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ mt: 1 }}
            >
              Already have an account? Sign In
            </Button>
          </Box>
        );
      
      case 1:
        return (
          <Box component="form" onSubmit={handleOtpSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We've sent a verification code to {email}. Please check your inbox and enter the code below.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Verification Code"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={!otp}
            >
              Verify
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(0)}
              sx={{ mt: 1 }}
            >
              Change Email
            </Button>
          </Box>
        );
      
      case 2:
        return (
          <Box component="form" onSubmit={handleSignupSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={!name || !password || !confirmPassword}
            >
              Create Account
            </Button>
          </Box>
        );
      
      default:
        return null;
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
          <PersonAddIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Create GradGear Account
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default Signup; 