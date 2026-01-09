'use client';

import { useState } from 'react';
import { Stack, Button, Typography } from '@mui/material';
import { DrawCanvas } from '<@>/components/DrawCanvas/DrawCanvas';
import { DrawVisualizer } from '<@>/components/DrawVisualizer/DrawVisualizer';
import { ModelLayer } from '<@>/types';

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

  const handlePredict = async (pixels: number[]) => {
    setActivations([]);
    setPredicted(null);
    try {
      const res = await fetch('http://localhost:8000/draw', {
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
    <Stack spacing={4} alignItems="center">
      <Typography variant="h4" fontWeight="bold">
        Draw a Digit
      </Typography>

      <DrawCanvas onPredict={handlePredict} />

      {activations.length > 0 && (
        <DrawVisualizer modelConfig={modelConfig} forward={activations} predicted={predicted} />
      )}
    </Stack>
  );
}
