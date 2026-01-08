import { Container, Stack, Typography, Box, Link, Button } from '@mui/material';
import React from 'react';

const HomePage = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Stack spacing={10} alignItems="center" justifyContent={'center'} height="100%">
        <Typography variant="h2">Welcome </Typography>
        <Stack direction={'row'} spacing={10}>
          <Link href="/train" style={{ textDecoration: 'none' }}>
            <Button variant="contained" sx={{ height: '80px' }}>
              <Typography variant="h5"> Train your own</Typography>
            </Button>
          </Link>
          <Link href="/predict" style={{ textDecoration: 'none' }}>
            <Button variant="contained" sx={{ height: '80px' }}>
              <Typography variant="h5"> Draw and Visualize</Typography>
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Container>
  );
};
export default HomePage;
