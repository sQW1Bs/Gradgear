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
  Alert,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TimerIcon from '@mui/icons-material/Timer';

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
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const steps = ['Enter Email', 'Verify OTP', 'Create Account'];

  // Timer effect for OTP expiry
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
      if (activeStep === 1) {
        setError('OTP has expired. Please request a new one.');
      }
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timeRemaining, activeStep]);

  // Timer effect for resend cooldown
  useEffect(() => {
    let interval = null;
    
    if (resendDisabled && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prevTime => prevTime - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setResendDisabled(false);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendDisabled, resendCountdown]);

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
      setTimeRemaining(600); // Reset to 10 minutes
      setTimerActive(true);
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
      setTimerActive(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    }
  };
  
  const handleResendOtp = async () => {
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup/initiate', { email });
      setTimeRemaining(600); // Reset to 10 minutes
      setTimerActive(true);
      setResendDisabled(true);
      setResendCountdown(60); // 60 seconds cooldown before next resend
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
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
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <TimerIcon color="action" sx={{ mr: 1 }} />
              <Typography 
                variant="body1" 
                color={timeRemaining < 60 ? "error" : "text.primary"}
                fontWeight="medium"
              >
                OTP expires in: {formatTime(timeRemaining)}
              </Typography>
            </Box>
            
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
              variant="outlined"
              onClick={handleResendOtp}
              disabled={resendDisabled}
              sx={{ mb: 2 }}
            >
              {resendDisabled 
                ? `Resend OTP (${resendCountdown}s)` 
                : 'Resend OTP'}
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