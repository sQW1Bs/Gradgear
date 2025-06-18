import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Fab,
  TextField,
  InputAdornment,
  OutlinedInput
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (!userInfo) {
      navigate('/login');
      return;
    }

    // Get search query from URL if present
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('search');
    if (queryParam) {
      setSearchQuery(queryParam);
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, location.search]);

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddToCart = (product) => {
    // Get existing cart from localStorage or initialize empty array
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
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
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Dispatch custom event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: '.05em', color: 'primary.main' }}>
          Product Catalogue
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Search and filter section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6} lg={5}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: 300, md: 350, lg: 400 }, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}
            />
          </Grid>
        </Grid>
      </Box>

      {filteredProducts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: '30vh', md: '50vh' } }}>
          <Typography variant="h6" color="text.secondary">
            No products found matching your criteria.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {filteredProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 3,
                  boxShadow: 2,
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 8,
                    borderColor: 'primary.main',
                  },
                  bgcolor: 'background.paper',
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.hasImage ? `http://localhost:8080/api/products/${product.id}/image` : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  sx={{ objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="h6" color="primary">
                    ${product.price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Seller: {product.sellerName}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => navigate(`/product/${product.id}`)}
                    sx={{ fontWeight: 500 }}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(product)}
                    sx={{ fontWeight: 500 }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1200, boxShadow: 4 }}
        onClick={handleAddProduct}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default ProductCatalog; 