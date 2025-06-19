import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userInfo.id) {
      navigate('/login');
      return;
    }

    // Load user-specific cart items from localStorage
    const cartKey = `cart_${userInfo.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCartItems(cart);
    
    // Calculate total price
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setTotalPrice(total);
  }, [navigate]);

  const handleRemoveItem = (id) => {
    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const cartKey = `cart_${userInfo.id}`;

    // Filter out the item to remove
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    const total = updatedCart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setTotalPrice(total);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  };

  const handleCheckout = () => {
    setCheckoutDialogOpen(true);
  };

  const handleCloseCheckoutDialog = () => {
    setCheckoutDialogOpen(false);
  };

  const handleCompleteCheckout = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userInfo.id) {
        navigate('/login');
        return;
      }
      
      // Get product IDs from cart
      const productIds = cartItems.map(item => item.id);
      
      console.log('Order would be placed with:', { userId: userInfo.id, productIds });
      
      // Clear the user-specific cart
      const cartKey = `cart_${userInfo.id}`;
      localStorage.setItem(cartKey, JSON.stringify([]));
      setCartItems([]);
      setTotalPrice(0);
      setCheckoutDialogOpen(false);
      
      // Show success message
      setSuccessMessage('Order placed successfully! Thank you for your purchase.');
      
      // Redirect to orders page after a short delay
      setTimeout(() => {
        navigate('/my-orders');
      }, 2000);
    } catch (error) {
      console.error('Error handling checkout:', error);
      alert('Failed to complete checkout. Please try again.');
      setCheckoutDialogOpen(false);
    }
  };

  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 4 }}
      >
        Continue Shopping
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Cart
      </Typography>
      {cartItems.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Paper>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 3 }}>
            <Grid container spacing={2}>
              {cartItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      borderRadius: 2,
                      boxShadow: 1,
                      p: 2,
                      height: '100%',
                      bgcolor: 'background.paper',
                      mb: 2
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mb: 1, boxShadow: 1 }}
                      image={item.hasImage ? `http://localhost:8080/api/products/${item.id}/image` : 'https://via.placeholder.com/120x120?text=No+Image'}
                      alt={item.name}
                    />
                    <CardContent sx={{ flex: '1 0 auto', width: '100%', p: 0 }}>
                      <Typography component="div" variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" component="div" sx={{ textAlign: 'center' }}>
                        Seller: {item.sellerName}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ textAlign: 'center', mt: 1 }}>
                        ${item.price}
                      </Typography>
                    </CardContent>
                    <IconButton 
                      aria-label="remove from cart" 
                      onClick={() => handleRemoveItem(item.id)}
                      color="error"
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">
                Items ({cartItems.length}):
              </Typography>
              <Typography variant="body1">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Total:
              </Typography>
              <Typography variant="h6" color="primary">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ShoppingCartCheckoutIcon />}
              onClick={handleCheckout}
              sx={{ mt: 2, py: 1.5, fontWeight: 600, fontSize: '1.1rem' }}
            >
              Checkout
            </Button>
          </Paper>
        </Box>
      )}
      {/* Checkout Confirmation Dialog */}
      <Dialog open={checkoutDialogOpen} onClose={handleCloseCheckoutDialog}>
        <DialogTitle>Complete Your Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will place your order for all items in your cart.
            Would you like to complete this purchase?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckoutDialog}>Cancel</Button>
          <Button onClick={handleCompleteCheckout} variant="contained" autoFocus>
            Complete Purchase
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccessMessage}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default Cart; 