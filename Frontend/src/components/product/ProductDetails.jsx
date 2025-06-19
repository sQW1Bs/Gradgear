import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/products/${id}`);
        setProduct(response.data);
        
        // Fetch seller details
        const sellerResponse = await axios.get(`http://localhost:8080/api/users/${response.data.sellerId}`);
        setSeller(sellerResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleContactSeller = () => {
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
  };

  const handleAddToCart = () => {
    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userInfo.id) {
      navigate('/login');
      return;
    }

    // Get user-specific cart key
    const cartKey = `cart_${userInfo.id}`;
    
    // Get existing cart from localStorage or initialize empty array
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    // Check if product is already in cart
    const isProductInCart = cart.some(item => item.id === product.id);
    
    if (!isProductInCart) {
      // Add product to cart
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        hasImage: product.hasImage,
        sellerId: product.sellerId,
        sellerName: product.sellerName
      });
      
      // Save updated cart to localStorage
      localStorage.setItem(cartKey, JSON.stringify(cart));
      
      // Show success message
      setAddedToCart(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
      
      // Dispatch custom event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      // Already in cart - still show message
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 4 }}
      >
        Back to Products
      </Button>
      
      {addedToCart && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Product added to cart successfully!
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: { xs: 240, sm: 320, md: 400 },
                mb: 2
              }}
            >
              <Box
                component="img"
                sx={{
                  width: { xs: 220, sm: 300, md: 380 },
                  height: { xs: 220, sm: 300, md: 380 },
                  objectFit: 'cover',
                  borderRadius: 3,
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  boxShadow: 2,
                  background: '#fafafa',
                  p: 1
                }}
                src={product.hasImage ? `http://localhost:8080/api/products/${product.id}/image` : 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={product.name}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            
            <Typography variant="body1" paragraph>
              {product.description || 'No description available'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Seller: {product.sellerName}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                fullWidth
              >
                Add to Cart
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleContactSeller}
                fullWidth
              >
                Contact Seller
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Contact Seller Dialog */}
      <Dialog open={contactDialogOpen} onClose={handleCloseContactDialog}>
        <DialogTitle>Contact Seller</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can reach the seller using the following contact information:
          </DialogContentText>
          <List>
            {seller?.email && (
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={seller.email} />
              </ListItem>
            )}
            {seller?.phoneNo && (
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={seller.phoneNo} />
              </ListItem>
            )}
            {!seller?.phoneNo && !seller?.email && (
              <ListItem>
                <ListItemText primary="No contact information available" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetails; 