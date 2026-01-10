'use client';
import React, { useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Paper,
  Card,
  Grid,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Tooltip,
  Link,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TuneIcon from '@mui/icons-material/Tune';
import LayersIcon from '@mui/icons-material/Layers';
import TrainVisualizer from '<@>/components/TrainVisualizer/TrainVisualizer';
import { ModelLayer } from '<@>/types';
import theme from '<@>/theme';
import { validateModel } from '<@>/lib/train';

const OPTIMIZERS = ['Adam', 'SGD', 'RMSprop'];
const LAYER_TYPES = ['linear', 'relu', 'sigmoid'];

const TrainPage: React.FC = () => {
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [layers, setLayers] = useState<ModelLayer[]>([
    { type: 'linear', in: 784, out: 128 },
    { type: 'relu' },
    { type: 'linear', in: 128, out: 10 },
  ]);
  const [config, setConfig] = useState({
    lr: 0.001,
    epochs: 5,
    batch_size: 32,
    optimizer: 'Adam',
  });

  const [hideReLULayers, setHideReLULayers] = useState(false);
  const [showGrad, setShowGrad] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [sendEvery, setSendEvery] = useState<number | string>(32);
  const [wsSleep, setWsSleep] = useState<number | string>(0.01);

  const handleCloseNotify = () => setNotification({ ...notification, open: false });

  const updateLayer = (index: number, field: string, value: string) => {
    const newLayers = [...layers];
    const sanitizedValue = value === '' ? '' : field === 'type' ? value : Number(value);
    newLayers[index] = { ...newLayers[index], [field]: sanitizedValue };
    setLayers(newLayers);
  };

  const handleStartTraining = async () => {
    if (!validateModel(layers, setNotification)) return;

    try {
      const response = await fetch('http://localhost:8000/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layers: layers,
          ...config,
          send_every: Number(sendEvery) || 32,
          ws_sleep: Number(wsSleep) || 0,
        }),
      });

      if (response.ok) {
        setNotification({
          open: true,
          message: 'Training Engine Initialized!',
          severity: 'success',
        });
        setIsTraining(true);
      }
    } catch (e) {
      setNotification({
        open: true,
        message: 'Connection Error: Is the backend running?',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background: `
      linear-gradient(
        180deg,
        #0f172a,
        #1e293b,
        #0b1f4b,
        #0e1347,
        #0f172a
      )
    `,
        backgroundSize: '100% 300%',
        animation: 'trainGradient 22s ease-in-out infinite',

        '@keyframes trainGradient': {
          '0%': {
            backgroundPosition: '50% 0%',
          },
          '50%': {
            backgroundPosition: '50% 100%',
          },
          '100%': {
            backgroundPosition: '50% 0%',
          },
        },
      }}
    >
      <Container sx={{ pt: 6 }}>
        <Stack spacing={4}>
          <Stack direction="row" alignItems={'center'} justifyContent={'space-between'} p={4}>
            <Stack>
              <Typography
                variant="h2"
                fontWeight="800"
                sx={{
                  background: 'linear-gradient(90deg, #60a5fa, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Training Studio
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Design your network. Ensure the input (784) and output (10) match the MNIST dataset
                requirements.
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

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TuneIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Global Config
                    </Typography>
                  </Stack>
                  <TextField
                    label="Learning Rate"
                    type="number"
                    value={config.lr}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lr: e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    label="Epochs"
                    type="number"
                    value={config.epochs}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        epochs: e.target.value === '' ? 0 : Number(e.target.value),
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    select
                    label="Optimizer"
                    value={config.optimizer}
                    onChange={(e) => setConfig({ ...config, optimizer: e.target.value })}
                    fullWidth
                  >
                    {OPTIMIZERS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Paper>
            </Grid>

            {/* Architecture Card */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" mb={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LayersIcon color="secondary" />
                    <Typography variant="h6" fontWeight="bold">
                      Layer Stack
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon sx={{ color: 'white' }} />}
                    onClick={() => setLayers([...layers, { type: 'linear', in: 128, out: 64 }])}
                  >
                    <Typography> Add Layer</Typography>
                  </Button>
                </Stack>

                <Stack spacing={1.5}>
                  {layers.map((layer, index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Typography variant="caption" sx={{ minWidth: 40, opacity: 0.5 }}>
                        L{index}
                      </Typography>
                      <TextField
                        select
                        size="small"
                        value={layer.type}
                        onChange={(e) => updateLayer(index, 'type', e.target.value)}
                        sx={{ width: 120 }}
                      >
                        {LAYER_TYPES.map((t) => (
                          <MenuItem key={t} value={t}>
                            {t.toUpperCase()}
                          </MenuItem>
                        ))}
                      </TextField>

                      {layer.type === 'linear' && (
                        <>
                          <TextField
                            label="In"
                            size="small"
                            type="number"
                            value={layer.in ?? ''}
                            onChange={(e) => updateLayer(index, 'in', e.target.value)}
                            sx={{ width: 100 }}
                          />
                          <TextField
                            label="Out"
                            size="small"
                            type="number"
                            value={layer.out ?? ''}
                            onChange={(e) => updateLayer(index, 'out', e.target.value)}
                            sx={{ width: 100 }}
                          />
                        </>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => setLayers(layers.filter((_, i) => i !== index))}
                        color="error"
                        sx={{ ml: 'auto' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Advanced & Visual Controls */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: 'transparent',
              border: '1px dashed rgba(255,255,255,0.2)',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={hideReLULayers}
                        onChange={() => setHideReLULayers(!hideReLULayers)}
                        sx={{
                          color: '#fff',
                          '&.Mui-checked': { color: '#fff' },
                        }}
                      />
                    }
                    label="Hide Non-Linearities"
                    sx={{ color: '#fff' }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showGrad}
                        onChange={() => setShowGrad(!showGrad)}
                        sx={{
                          color: '#fff',
                          '&.Mui-checked': { color: '#fff' },
                        }}
                      />
                    }
                    label="Visualize Gradients"
                    sx={{ color: '#fff' }}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Tooltip title="How many steps to skip before sending a visual update">
                    <TextField
                      label="Batch Interval"
                      size="small"
                      value={sendEvery}
                      onChange={(e) => setSendEvery(e.target.value)}
                      sx={{ width: 100 }}
                    />
                  </Tooltip>
                  <Tooltip title="Delay in seconds to slow down visualization for study">
                    <TextField
                      label="Frame Delay"
                      size="small"
                      value={wsSleep}
                      onChange={(e) => setWsSleep(e.target.value)}
                      sx={{ width: 100 }}
                    />
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Button
            variant="contained"
            fullWidth
            onClick={handleStartTraining}
            sx={{
              py: 2,
              borderRadius: 3,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            }}
            startIcon={<PlayArrowIcon />}
          >
            Launch Neural Training
          </Button>
        </Stack>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotify}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotify}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {isTraining && (
        <TrainVisualizer
          modelConfig={{ ...config, layers }}
          isTraining={isTraining}
          hideReluLayers={hideReLULayers}
          showGrad={showGrad}
        />
      )}
    </Box>
  );
};

export default TrainPage;
