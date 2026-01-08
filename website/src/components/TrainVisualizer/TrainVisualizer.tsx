'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { ModelConfig } from '<@>/types';

interface TrainVisualizerProps {
  modelConfig: ModelConfig;
  isTraining: boolean;
  hideReluLayers?: boolean;
  showGrad: boolean;
}

type TrainingData = {
  forward: number[][]; // per-layer, per-neuron
  backward: number[][];
  loss: number;
  predicted?: number;
  trueLabel?: number;
  accuracy?: number;
};

const TrainVisualizer: React.FC<TrainVisualizerProps> = ({
  modelConfig,
  isTraining,
  hideReluLayers = false,
  showGrad = true,
}) => {
  const [trainingData, setTrainingData] = useState<TrainingData>({
    forward: [],
    backward: [],
    loss: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const [trainingStopped, setTrainingStopped] = useState(false);

  useEffect(() => {
    const connect = async () => {
      if (!isTraining || typeof window === 'undefined') return;

      const ws = new WebSocket('ws://localhost:8000/ws/train');
      wsRef.current = ws;
      setTrainingStopped(false);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setTrainingData({
          forward: data.forward_wave ?? [],
          backward: data.backward_wave ?? [],
          loss: data.loss ?? 0,
          predicted: data.predicted,
          trueLabel: data.trueLabel,
          accuracy: data.accuracy,
        });
      };

      ws.onclose = () => {
        setTrainingStopped(true);
      };

      ws.onerror = () => {
        setTrainingStopped(true);
      };

      return () => ws.close();
    };
    connect();
  }, [isTraining]);

  const layersToRender = hideReluLayers
    ? modelConfig.layers.filter((l) => l.type.toLowerCase() !== 'relu')
    : modelConfig.layers;

  return (
    <Stack alignItems={'center'} justifyContent={'center'}>
      {trainingStopped && (
        <Box
          sx={{
            backgroundColor: 'rgba(255,0,0,0.85)',
            borderRadius: 1,
            padding: 1,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#fff' }}>
            Training Stopped
          </Typography>
        </Box>
      )}
      <Paper
        sx={{
          width: '96.5%',
          height: '100vh',
          p: 4,
          backgroundColor: '#020617',
          color: '#fff',
          borderRadius: 4,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          mb={4}
          sx={{ height: '10%', minHeight: '50px' }}
        >
          <Typography variant="h5" fontWeight="bold">
            Live Neural Network
          </Typography>
          <Stack>
            <Typography color="primary.light" variant="h5" sx={{ fontFamily: 'monospace' }}>
              LOSS: {trainingData.loss.toFixed(4)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              ACCURACY: {trainingData.accuracy}
            </Typography>
            {trainingData.predicted !== undefined && trainingData.trueLabel !== undefined && (
              <>
                <Typography variant="caption">
                  Predicted: {trainingData.predicted}, True: {trainingData.trueLabel}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            minHeight: '400px',
            width: '100%',
            flexWrap: 'nowrap',
            overflowX: 'auto',
          }}
        >
          {layersToRender.map((layer, idx) => {
            const origIdx = modelConfig.layers.indexOf(layer);
            const layerActivation = trainingData.forward[origIdx] ?? [];
            const neuronCount =
              layerActivation.length || (layer.type === 'linear' ? layer.out : 0) || 784;
            const layerGradient = trainingData.backward[origIdx] ?? Array(neuronCount).fill(0);

            const isInput = origIdx === 0;
            const isOutput = layer.type.toLowerCase() === 'linear' && layer.out === 10;
            const isLargeLayer = neuronCount > 128;
            const cols = isOutput ? 1 : isInput ? 28 : Math.ceil(Math.sqrt(neuronCount));
            const dotSize = isInput ? 6 : isLargeLayer ? 8 : 12;
            const gradientIntensity = showGrad ? (layerGradient[origIdx] ?? 0) * 0.75 : 0;
            return (
              <Box key={origIdx} sx={{ textAlign: 'center', transition: 'all 0.3s' }}>
                <Typography
                  variant="caption"
                  sx={{
                    mb: 1.5,
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    letterSpacing: 1,
                  }}
                >
                  {layer.type.toUpperCase()} ({neuronCount})
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`,
                    gap: isLargeLayer ? '2px' : '6px',
                    justifyContent: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: isLargeLayer ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: isLargeLayer ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  {(layerActivation.length > 0 ? layerActivation : Array(neuronCount).fill(0)).map(
                    (intensity, nIdx) => (
                      <motion.div
                        key={nIdx}
                        animate={{
                          backgroundColor: `rgba(96,165,250,${0.3 + 0.7 * intensity})`,
                          boxShadow: `
  0px 0px ${dotSize}px rgba(96,165,250,${0.5 * intensity}),
  0px 0px ${dotSize * 1.5}px rgba(255, 60, 60, ${gradientIntensity})
`,

                          scale: 1 + 0.3 * intensity,
                        }}
                        transition={{ duration: 0.1 }}
                        style={{
                          width: dotSize,
                          height: dotSize,
                          borderRadius: isLargeLayer ? '2px' : '50%',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    ),
                  )}
                </Box>
              </Box>
            );
          })}
          <Stack spacing="8px" mt={6.5}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  height: 12,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: trainingData.predicted === i ? 'primary.main' : '#475569',
                  fontWeight: trainingData.predicted === i ? 'bold' : 'normal',
                }}
              >
                {i}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Stack>
  );
};

export default TrainVisualizer;
