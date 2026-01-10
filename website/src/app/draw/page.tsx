'use client';

import { useState } from 'react';
import {
  Stack,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Slider,
  Button,
  Link,
} from '@mui/material';
import { DrawCanvas } from '<@>/components/DrawCanvas/DrawCanvas';
import { DrawVisualizer } from '<@>/components/DrawVisualizer/DrawVisualizer';
import { ModelLayer } from '<@>/types';
import BrushIcon from '@mui/icons-material/Brush';
import PsychologyIcon from '@mui/icons-material/Psychology';
import theme from '<@>/theme';
import { API_BASE } from '<@>/lib/train';

const modelConfig: ModelLayer[] = [
  { type: 'linear', in: 784, out: 1024 },
  { type: 'relu' },
  { type: 'batchnorm' },
  { type: 'linear', in: 1024, out: 512 },
  { type: 'relu' },
  { type: 'batchnorm' },
  { type: 'linear', in: 512, out: 256 },
  { type: 'relu' },
  { type: 'batchnorm' },
  { type: 'linear', in: 256, out: 128 },
  { type: 'relu' },
  { type: 'batchnorm' },
  { type: 'linear', in: 128, out: 10 },
];

export default function DrawPage() {
  const [activations, setActivations] = useState<number[][]>([]);
  const [predicted, setPredicted] = useState<number | null>(null);
  const [sensitivity, setSensitivity] = useState<number>(0.75);
  const [brushSize, setBrushSize] = useState<number>(12);
  const handlePredict = async (pixels: number[]) => {
    setActivations([]);
    setPredicted(null);
    try {
      const res = await fetch(`${API_BASE}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pixels),
      });

      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();

      if (data.forward_wave) {
        setActivations(data.forward_wave);
        setPredicted(data.predicted);
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',

        background: `
      linear-gradient(
        270deg,
        #0f172a,
        #1e293b,
        #0f123a,
        #150d36,
        #0f172a
      )
    `,
        backgroundSize: '400% 400%',
        animation: 'drawGradient 30s smooth infinite',

        '@keyframes drawGradient': {
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
      <Stack
        direction={'row'}
        sx={{
          px: 0,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: '',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Stack direction="row" spacing={5} alignItems="center">
          <Typography
            variant="h2"
            fontWeight="800"
            sx={{
              background: 'linear-gradient(90deg, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Model Inference
          </Typography>
        </Stack>
        <Link href="/">
          <Button
            variant="outlined"
            sx={{
              '&:hover': {
                borderColor: theme.palette.info.main,
              },
            }}
          >
            <Typography variant="h6">Go Back</Typography>
          </Button>
        </Link>
      </Stack>

      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{ p: 2, borderRight: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Stack spacing={2} height="100%">
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: 'primary.dark', color: 'white', borderRadius: 2 }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                INPUT SOURCE
              </Typography>
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 1,
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <DrawCanvas
                  onPredict={handlePredict}
                  sensitivity={sensitivity}
                  brushSize={brushSize}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{ mt: 1, display: 'block', textAlign: 'center', opacity: 0.7 }}
              >
                28x28 Grayscale Canvas
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                color: 'white',
                borderRadius: 2,
                flexGrow: 1,
              }}
            >
              <Typography variant="h4" gutterBottom>
                Instructions
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">
                      Drawing sensitivity
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                      ({sensitivity.toFixed(2)}×)
                    </Typography>
                  </Stack>

                  <Slider
                    size="small"
                    min={0.01}
                    max={1}
                    step={0.01}
                    value={sensitivity}
                    onChange={(_, value) => setSensitivity(value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v.toFixed(2)}×`}
                    sx={{
                      color: '#66a5f7',
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">
                      Brush size
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                      ({brushSize.toFixed(2)}×)
                    </Typography>
                  </Stack>

                  <Slider
                    size="small"
                    min={1}
                    max={24}
                    step={1}
                    value={brushSize}
                    onChange={(_, value) => setBrushSize(value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v.toFixed(2)}×`}
                    sx={{
                      color: '#66a5f7',
                    }}
                  />
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <BrushIcon fontSize="small" />
                    <Typography variant="body2" fontWeight="bold">
                      Draw
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Draw a digit (0-9) centered in the box above.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%', position: 'relative' }}>
          {activations.length > 0 ? (
            <Box
              sx={{
                height: '100%',
                overflowY: 'hidden',
                p: 3,
                bgcolor: 'rgba(0,0,0,0.2)',
              }}
            >
              <Stack
                direction={'row'}
                justifyContent={'space-between  '}
                alignItems={'center'}
                spacing={2}
                p={2}
              >
                <Typography variant="h6" fontWeight="600">
                  Forward Pass: Activation Mapping
                </Typography>
                {predicted !== null && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="rgba(255,255,255,0.6)">
                      Last Prediction:
                    </Typography>
                    <Typography variant="h5" fontWeight="900" color="#60a5fa">
                      {predicted}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Chip
                label="Live Model: Pretrained MNIST"
                size="small"
                sx={{ color: '#60a5fa', borderColor: '#60a5fa', border: '1px solid', m: 2, mt: 0 }}
              />
              <DrawVisualizer
                modelConfig={modelConfig}
                forward={activations}
                predicted={predicted}
              />
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                opacity: 0.3,
              }}
            >
              <PsychologyIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
              <Typography variant="h5" color="white">
                Awaiting Input...
              </Typography>
              <Typography variant="body2" color="white">
                Draw a digit to start the visualization
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
