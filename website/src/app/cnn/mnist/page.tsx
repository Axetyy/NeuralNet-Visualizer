'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  Slider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImagePicker from '<@>/components/CNNMusem/ImagePicker';
import { CNNStage } from '<@>/components/CNNMusem/CNNStage';
import { CNNLayer } from '<@>/types';
import { API_BASE } from '<@>/lib/train';

export default function CNNPage() {
  const [trace, setTrace] = useState<CNNLayer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState<number>(6);
  const [scale, setScale] = useState<number>(1);
  const [spacing, setSpacing] = useState<number>(2);
  const [distance, setDistance] = useState<number>(12);
  const handleSelect = async (pixels: number[]) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inference/cnn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pixels),
      });
      const data = await res.json();
      setTrace(data.trace);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        bgcolor: '#020617',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        py={1.5}
        sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: '#0f172a' }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={() => window.history.back()}
            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="h3"
            fontWeight="800"
            sx={{
              background: 'linear-gradient(90deg, #60a5fa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CNN Museum / FashionMNIST
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600 }}>
          FASHION_MNIST_V1.0
        </Typography>
      </Stack>

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <Box
          sx={{
            width: 320,
            borderRight: '1px solid rgba(255,255,255,0.05)',
            p: 3,
            bgcolor: '#0b0f1a',
            overflowY: 'auto',
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: '#60a5fa', fontWeight: 700, mb: 2, display: 'block' }}
          >
            Input Selection
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 2,
            }}
          >
            <ImagePicker onSelect={handleSelect} />
          </Paper>

          {trace && (
            <Stack spacing={2} mt={4}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => setTrace(null)}
                sx={{ mt: 2, borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
              >
                Reset View
              </Button>
              <Typography variant="overline" sx={{ color: '#c084fc', fontWeight: 700 }}>
                Network Trace
              </Typography>
              {trace.map((layer, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderLeft: '3px solid #60a5fa',
                  }}
                >
                  <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>
                    {layer.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>
                    {layer.shape.join(' × ')}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: '#020617' }}>
          {loading ? (
            <Stack sx={{ height: '100%' }} alignItems="center" justifyContent="center" spacing={2}>
              <CircularProgress size={24} sx={{ color: '#60a5fa' }} />
              <Typography variant="caption" sx={{ opacity: 0.5, letterSpacing: 2 }}>
                COMPUTING FORWARD PASS...
              </Typography>
            </Stack>
          ) : !trace ? (
            <Stack sx={{ height: '100%' }} alignItems="center" justifyContent="center" spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.2 }}>
                SELECT A SUBJECT TO BEGIN ANALYSIS
              </Typography>
            </Stack>
          ) : (
            <Box sx={{ height: '100%', width: '100%' }}>
              <CNNStage
                trace={trace}
                scale={scale}
                threshold={threshold}
                spacing={spacing}
                distance={distance}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  bgcolor: 'primary.main',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid white',
                }}
              >
                <Stack>
                  <Typography variant="h4" gutterBottom>
                    Visual settings
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">
                      Scale of the convolutions.
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                      ({scale}×)
                    </Typography>
                  </Stack>

                  <Slider
                    size="small"
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={scale}
                    onChange={(_, value) => setScale(value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v.toFixed(2)}×`}
                    sx={{
                      color: '#66a5f7',
                    }}
                  />
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">
                      Threshold
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                      {threshold}
                    </Typography>
                  </Stack>

                  <Slider
                    size="small"
                    min={1}
                    max={128}
                    step={1}
                    value={threshold}
                    onChange={(_, value) => setThreshold(value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v.toFixed(2)}×`}
                    sx={{
                      color: '#66a5f7',
                    }}
                  />
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">
                      Spacing
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                      {spacing}
                    </Typography>
                  </Stack>

                  <Slider
                    size="small"
                    min={1}
                    max={4}
                    step={1}
                    value={spacing}
                    onChange={(_, value) => setSpacing(value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v.toFixed(2)}×`}
                    sx={{
                      color: '#66a5f7',
                    }}
                  />
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight="bold">
                      Distance
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">
                      {distance}
                    </Typography>
                  </Stack>

                  <Slider
                    size="small"
                    min={5}
                    max={50}
                    step={1}
                    value={distance}
                    onChange={(_, value) => setDistance(value)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v.toFixed(2)}×`}
                    sx={{
                      color: '#66a5f7',
                    }}
                  />
                </Stack>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 2,
                  py: 1,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#60a5fa' }}>
                  Tip: Click any layer to expand feature maps
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
