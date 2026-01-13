'use client';
import {
  Container,
  Stack,
  Typography,
  Box,
  Link,
  Button,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
const HomePage = () => {
  return (
    <Box sx={{ scrollBehavior: 'smooth' }}>
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
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '120px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.35))',
              pointerEvents: 'none',
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
                A Multi-Layer Perceptron (MLP) is the most basic type of neural network. This
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
                      Use the interactive canvas to draw inputs and see how the model interprets
                      your data with real-time updates and neuron activations.
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

          <IconButton
            onClick={() => {
              const nextSection = document.getElementById('cnn-section');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.35)',
                transform: 'translateX(-50%) translateY(-4px)',
              },
              transition: 'all 0.3s ease',
              zIndex: 10,
              animation: 'bounce 2s infinite',
            }}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 50 }} />
          </IconButton>
          <Box
            component="style"
            dangerouslySetInnerHTML={{
              __html: `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
        40% { transform: translateX(-50%) translateY(-10px); }
        60% { transform: translateX(-50%) translateY(-6px); }
      }
    `,
            }}
          />
        </Container>
      </Box>
      <Box
        id="cnn-section"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',

          background: `
      linear-gradient(
        135deg,
        #004d40,
        #00695c,
        #1b5e20,
        #2e7d32,
        #004d40
      )
    `,
          backgroundSize: '400% 400%',
          animation: 'gradientFlow2 20s ease infinite',

          '@keyframes gradientFlow2': {
            '0%': { backgroundPosition: '100% 50%' },
            '50%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '100% 50%' },
          },
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={5} alignItems="center" textAlign="center">
            <Typography variant="h2" fontWeight={700} color="white">
              CNN Museum
            </Typography>

            <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ maxWidth: 650 }}>
              Explore how Convolutional Neural Networks see the world. Step through feature maps,
              filters, pooling layers, and understand how CNNs extract spatial meaning from images.
            </Typography>

            <Paper
              elevation={8}
              sx={{
                p: 5,
                maxWidth: 420,
                width: '100%',
                borderRadius: 4,
                textAlign: 'center',
                transition: 'transform 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                },
              }}
            >
              <Typography variant="h4" fontWeight={600} gutterBottom color="black">
                Enter the Museum
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Interactive CNN visualizations, layer-by-layer breakdowns, and real image feature
                extraction. Datasets included : FashionMNIST
              </Typography>

              <Link href="/cnn/mnist" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  sx={{ py: 1.8 }}
                >
                  Explore CNNs
                </Button>
              </Link>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
