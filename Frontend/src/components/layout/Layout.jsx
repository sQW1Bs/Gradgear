import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      </Container>
    </>
  );
};

export default Layout; 