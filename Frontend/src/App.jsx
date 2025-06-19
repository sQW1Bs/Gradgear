import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import UserProfile from './components/profile/UserProfile';
import ProductCatalog from './components/product/ProductCatalog';
import AddProduct from './components/product/AddProduct';
import EditProduct from './components/product/EditProduct';
import MyProducts from './components/product/MyProducts';
import ProductDetails from './components/product/ProductDetails';
import Cart from './components/cart/Cart';
import Layout from './components/layout/Layout';
import MyOrders from './components/orders/MyOrders';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('user');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductCatalog />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-product" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AddProduct />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-product/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <EditProduct />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-products" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MyProducts />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/product/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductDetails />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Cart />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-orders" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MyOrders />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
