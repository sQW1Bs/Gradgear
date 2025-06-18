import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MyOrders = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 4 }}
      >
        Back to Products
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center', mt: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Order history feature is currently under development.
        </Alert>
        <Typography variant="body1">
          Check back later for a detailed order history.
        </Typography>
      </Paper>
    </Container>
  );
};

export default MyOrders; 