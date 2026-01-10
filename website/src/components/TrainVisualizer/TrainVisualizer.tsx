'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Stack, Divider, Chip, Button } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import AssesmentIcon from '@mui/icons-material/Assessment';
import { GlowState, ModelConfig } from '<@>/types';
import { API_BASE } from '<@>/lib/train';

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
const MotionPaper = motion(Paper);
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
  const [glow, setGlow] = useState<GlowState>(null);
  const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = async () => {
      if (!isTraining || typeof window === 'undefined') return;

      const ws = new WebSocket(`wss://neuralnet-visualizer.onrender.com/ws/train`);
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
  useEffect(() => {
    const glow = async () => {
      const { predicted, trueLabel } = trainingData;

      if (predicted === undefined || trueLabel === undefined) return;

      const isCorrect = predicted === trueLabel;

      setGlow(isCorrect ? 'correct' : 'wrong');

      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }

      glowTimeoutRef.current = setTimeout(() => {
        setGlow(null);
      }, 200);
    };
    glow();
  }, [trainingData.predicted, trainingData.trueLabel]);

  const layersToRender = hideReluLayers
    ? modelConfig.layers.filter((l) => l.type.toLowerCase() !== 'relu')
    : modelConfig.layers;

  return (
    <Stack spacing={2} sx={{ width: '100%', mt: 4, position: 'relative' }}>
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow:
            glow === 'correct'
              ? '0 0 50px rgba(34, 197, 94, 0.2)'
              : glow === 'wrong'
              ? '0 0 50px rgba(239, 68, 68, 0.2)'
              : '0 10px 30px rgba(0,0,0,0.5)',
        }}
        sx={{
          p: 4,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          color: '#fff',
          minHeight: '600px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={6}>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
              Live Execution Trace
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Real-time weights & activation firing
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={4}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
            }
          >
            <Box textAlign="right">
              <Typography
                sx={{
                  color: '#60a5fa',
                  fontFamily: 'monospace',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                {trainingData.loss.toFixed(4)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                CURRENT LOSS
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography
                sx={{
                  color: '#c084fc',
                  fontFamily: 'monospace',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                {trainingData.accuracy !== undefined
                  ? (trainingData.accuracy * 100).toFixed(2)
                  : '0'}
                %
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                ACCURACY
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            overflowX: 'auto',
            py: 4,
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

            const dotSize = isOutput ? 28 : isInput ? 6 : isLargeLayer ? 8 : 12;
            const gradientIntensity = showGrad ? (layerGradient[origIdx] ?? 0) * 0.75 : 0;
            return (
              <Box key={origIdx} sx={{ textAlign: 'center', transition: 'all 0.3s' }}>
                <Chip
                  label={`${layer.type.toUpperCase()}`}
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 'bold',
                    fontSize: '0.6rem',
                  }}
                />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`,
                    gap: isLargeLayer ? '1px' : '4px',
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {(layerActivation.length > 0 ? layerActivation : Array(neuronCount).fill(0)).map(
                    (intensity, nIdx) => (
                      <motion.div
                        key={nIdx}
                        animate={{
                          backgroundColor:
                            isOutput && trainingData.predicted === nIdx
                              ? '#22c55e'
                              : `rgba(96,165,250,${0.1 + 0.9 * intensity})`,
                          scale:
                            isOutput && trainingData.predicted === nIdx ? 1.2 : 1 + 0.2 * intensity,
                          boxShadow:
                            isOutput && trainingData.predicted === nIdx
                              ? '0 0 14px rgba(0, 255, 120, 1)'
                              : `
          0px 0px ${dotSize}px rgba(96,165,250,${0.4 * intensity}),
          0px 0px ${dotSize * 1.4}px rgba(255, 60, 60, ${gradientIntensity})
        `,
                        }}
                        transition={{ duration: 0.12 }}
                        style={{
                          width: dotSize,
                          height: dotSize,
                          borderRadius: isOutput ? '4px' : '50%',
                          boxShadow:
                            intensity > 0.5 ? `0 0 10px rgba(96,165,250,${intensity})` : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {isOutput && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: 14,
                              lineHeight: 1,
                              pointerEvents: 'none',
                              opacity: intensity > 0.15 ? 1 : 0.4,
                            }}
                          >
                            {nIdx}
                          </Typography>
                        )}
                      </motion.div>
                    ),
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: 'block', opacity: 0.4, fontSize: '0.6rem' }}
                >
                  {neuronCount} units
                </Typography>
              </Box>
            );
          })}
        </Box>
        <AnimatePresence>
          {trainingStopped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <Stack alignItems="center" spacing={3}>
                <AssesmentIcon sx={{ fontSize: 60, color: 'white' }} />
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Training Complete
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'primary.light', fontFamily: 'monospace' }}>
                    Final Accuracy: {trainingData.accuracy?.toFixed(2)}%
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.reload()}
                  sx={{ color: 'gradients.primary' }}
                >
                  <Typography>Configure New Run</Typography>
                </Button>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionPaper>
      <Stack direction="row" spacing={2} justifyContent="center">
        {trainingData.predicted !== undefined && (
          <Paper
            sx={{
              px: 3,
              py: 1,
              borderRadius: 10,
              bgcolor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography variant="body2">
              Latest Inference:{' '}
              <span
                style={{ color: glow === 'correct' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}
              >
                {trainingData.predicted}
              </span>
              <span style={{ opacity: 0.5, marginLeft: 8 }}>
                (Target: {trainingData.trueLabel})
              </span>
            </Typography>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
};

export default TrainVisualizer;
