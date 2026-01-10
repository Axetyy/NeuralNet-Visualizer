import { Container, Stack, Typography, Box, Link, Button, Paper, Grid } from '@mui/material';

const HomePage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        background: `
      linear-gradient(
        135deg,
        #1a237e,
        #0d47a1,
        #311b92,
        #0815c0,
        #1a237e
      )
    `,
        backgroundSize: '400% 400%',
        animation: 'gradientFlow 18s ease infinite',

        '@keyframes gradientFlow': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={6} alignItems="center">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h2" fontWeight="700" color="white" gutterBottom>
              Neural Network Visualizer.
            </Typography>
            <Typography variant="h6" color="rgba(255, 255, 255, 0.8)" sx={{ maxWidth: '600px' }}>
              A Multi Layered Perceptron (MLP) is the most basic type of neural network. This
              website was made to showcase what the inside of one looks like in real time as the
              &apos;neurons&apos; learn from MNIST.
            </Typography>
          </Stack>

          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 4,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight="600" color="primary" gutterBottom>
                    Train
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Configure hyperparameters and layers of the neural network and try to get as
                    high accuracy as possible.
                    <br />
                    <br />
                    Graphs will be provided afterwards to see the evolution of your model.
                  </Typography>
                </Box>
                <Link href="/train" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    sx={{ py: 2 }}
                  >
                    Get Started
                  </Button>
                </Link>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 4,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight="600" color="secondary" gutterBottom>
                    Visualize
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Use the interactive canvas to draw inputs and see how the model interprets your
                    data with real-time updates and neuron activations.
                    <br />
                    <br />
                    <strong> Average pretrained model accuracy : 97%</strong>
                  </Typography>
                </Box>
                <Link href="/draw" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    sx={{ py: 2 }}
                  >
                    Try Canvas
                  </Button>
                </Link>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;
