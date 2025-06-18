import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  InputAdornment,
  CircularProgress,
  OutlinedInput
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({ name: '', description: '', price: '' });
  const [productImage, setProductImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/products/${id}`);
        setProduct({
          name: response.data.name || '',
          description: response.data.description || '',
          price: response.data.price || ''
        });
        
        if (response.data.hasImage) {
          setPreviewImage(`http://localhost:8080/api/products/${id}/image?${new Date().getTime()}`);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProductImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      
      if (productImage) {
        formData.append('image', productImage);
      }
      
      await axios.put(`http://localhost:8080/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-products');
      }, 1500);
    } catch (err) {
      setError('Failed to update product');
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          width: '100%',
          maxWidth: 480,
          mx: 'auto',
          boxShadow: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/my-products')}
            sx={{ mr: 2 }}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
          <Typography component="h1" variant="h6" fontWeight={600} sx={{ flexGrow: 1, textAlign: 'center', letterSpacing: 1 }}>
            Edit Product
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            Product updated successfully! Redirecting...
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            id="name"
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleChange}
            variant="outlined"
            size="medium"
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 60 }}
          />
          <TextField
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={product.description}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Describe your product (condition, features, etc.)"
            variant="outlined"
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 300 }}
          />
          <TextField
            required
            fullWidth
            id="price"
            label="Price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            variant="outlined"
            sx={{ mb: 2 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
              Product Image
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="product-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="product-image-upload">
                <Button 
                  variant="outlined" 
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 1 }}
                  size="small"
                >
                  {previewImage ? 'Change Image' : 'Upload Image'}
                </Button>
              </label>
              {previewImage && (
                <Box 
                  sx={{ 
                    mt: 1, 
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <img 
                    src={previewImage} 
                    alt="Product preview" 
                    style={{ 
                      width: '100%',
                      maxWidth: '220px',
                      height: '220px',
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '6px',
                      background: '#fafafa'
                    }} 
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || success}
            sx={{ mt: 2, mb: 1, py: 1.2, fontWeight: 600, fontSize: '1rem', borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={22} /> : 'Update Product'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProduct; 