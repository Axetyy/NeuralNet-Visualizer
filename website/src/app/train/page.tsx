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
  Divider,
  Card,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import TrainVisualizer from '<@>/components/TrainVisualizer/TrainVisualizer';
import { ModelConfig } from '<@>/types';
import { ModelLayer } from '<@>/types';

const OPTIMIZERS = ['Adam', 'SGD', 'RMSprop'];
const LAYER_TYPES = ['linear', 'relu', 'sigmoid'];

const TrainPage: React.FC = () => {
  const [config, setConfig] = useState({
    lr: 0.001,
    epochs: 5,
    batch_size: 32,
    optimizer: 'Adam',
  });

  const [layers, setLayers] = useState<ModelLayer[]>([
    { type: 'linear', in: 784, out: 128 },
    { type: 'relu' },
    { type: 'linear', in: 128, out: 10 },
  ]);

  const addLayer = () => {
    setLayers([...layers, { type: 'linear', in: 128, out: 64 }]);
  };
  const [hideReLULayers, setHideReLULayers] = useState<boolean>(false);
  const [showGrad, setShowGrad] = useState<boolean>(true);
  const removeLayer = (index: number) => {
    setLayers(layers.filter((_, i) => i !== index));
  };
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [sendEvery, setSendEvery] = useState<number>(32);
  const [wsSleep, setWsSleep] = useState<number>(0.01);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateLayer = (index: number, field: string, value: any) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], [field]: value };
    setLayers(newLayers);
  };

  const handleStartTraining = async () => {
    const response = await fetch('http://localhost:8000/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layers,
        optimizer: config.optimizer,
        lr: config.lr,
        epochs: config.epochs,
        batch_size: config.batch_size,
        send_every: sendEvery,
        ws_sleep: wsSleep,
      }),
    });

    if (response.ok) {
      setIsTraining(true);
    }
  };
  const modelConfig: ModelConfig = {
    layers,
    optimizer: config.optimizer,
    lr: config.lr,
    epochs: config.epochs,
  };
  const handleChangeReLUVisibility = () => {
    setHideReLULayers((prev) => !prev);
  };
  const handleChangeGradVisibility = () => {
    setShowGrad((prev) => !prev);
  };
  return (
    <Box alignItems={'center'} justifyContent={'center'}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={4}>
          <Typography variant="h4" fontWeight="bold">
            Model Configuration
          </Typography>

          <Paper sx={{ p: 3, backgroundColor: 'background.paper' }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <SettingsIcon color="primary" />
              <TextField
                label="Learning Rate"
                type="number"
                value={config.lr}
                onChange={(e) => setConfig({ ...config, lr: parseFloat(e.target.value) })}
                size="small"
              />
              <TextField
                label="Epochs"
                type="number"
                value={config.epochs}
                onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) })}
                size="small"
              />
              <TextField
                select
                label="Optimizer"
                value={config.optimizer}
                onChange={(e) => setConfig({ ...config, optimizer: e.target.value })}
                size="small"
                sx={{ minWidth: '120px' }}
              >
                {OPTIMIZERS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Paper>

          <Divider />

          <Typography variant="h5">Architecture</Typography>
          <Stack spacing={2}>
            {layers.map((layer, index) => (
              <Card key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ minWidth: '80px' }}>
                  Layer {index}
                </Typography>

                <TextField
                  select
                  size="small"
                  value={layer.type}
                  onChange={(e) => updateLayer(index, 'type', e.target.value)}
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
                      type="number"
                      size="small"
                      value={layer.in}
                      onChange={(e) => updateLayer(index, 'in', parseInt(e.target.value))}
                      sx={{ width: '100px' }}
                    />
                    <TextField
                      label="Out"
                      type="number"
                      size="small"
                      value={layer.out}
                      onChange={(e) => updateLayer(index, 'out', parseInt(e.target.value))}
                      sx={{ width: '100px' }}
                    />
                  </>
                )}

                <IconButton onClick={() => removeLayer(index)} color="error" sx={{ ml: 'auto' }}>
                  <DeleteIcon />
                </IconButton>
              </Card>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addLayer}
              sx={{ borderStyle: 'dashed' }}
            >
              Add Layer
            </Button>
            <Stack direction={'row'} alignItems={'center'} spacing={2}>
              <Typography>Hide ReLU Layers?</Typography>
              <Checkbox
                checked={hideReLULayers}
                onChange={handleChangeReLUVisibility}
                slotProps={{ input: { 'aria-label': 'hide-relu-layers' } }}
              />

              <Typography>Show Grad effects?</Typography>
              <Checkbox
                checked={showGrad}
                onChange={handleChangeGradVisibility}
                slotProps={{ input: { 'aria-label': 'show-grad' } }}
              />

              <Typography>SEND_EVERY: {sendEvery}</Typography>
              <TextField
                type="number"
                size="small"
                value={sendEvery}
                onChange={(e) => setSendEvery(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ width: '60px' }}
              />

              <Typography>Delay (s): {wsSleep}</Typography>
              <TextField
                type="number"
                size="small"
                value={wsSleep}
                onChange={(e) => setWsSleep(Math.max(0, parseFloat(e.target.value) || 0))}
                sx={{ width: '100px' }}
              />
            </Stack>
          </Stack>

          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartTraining}
            sx={{ height: '56px', fontSize: '1.2rem' }}
          >
            Initialize & Start Training
          </Button>
        </Stack>
      </Container>
      {isTraining && (
        <TrainVisualizer
          modelConfig={modelConfig}
          isTraining={isTraining}
          hideReluLayers={hideReLULayers}
          showGrad={showGrad}
        />
      )}
    </Box>
  );
};

export default TrainPage;
