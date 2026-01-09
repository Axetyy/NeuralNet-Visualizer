'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ModelLayer } from '<@>/types';

interface DrawVisualizerProps {
  modelConfig: ModelLayer[];
  forward: number[][];
  predicted: number | null;
}

export const DrawVisualizer: React.FC<DrawVisualizerProps> = ({
  modelConfig,
  forward,
  predicted,
}) => {
  return (
    <Paper
      sx={{
        width: '90%',
        p: 4,
        backgroundColor: '#020617',
        color: '#fff',
        borderRadius: 4,
      }}
    >
      <Typography variant="h5" mb={3}>
        Neural Network Activation
      </Typography>

      <Box display="flex" gap={6} overflow="auto">
        {modelConfig.map((layer, idx) => {
          const activations = forward[idx] ?? [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const count = activations.length || (layer as any).out || 0;
          const cols = layer.out === 10 ? 1 : Math.ceil(Math.sqrt(count));
          const isOutputLayer = layer.type === 'linear' && layer.out === 10;

          if (layer.type !== 'linear') return;
          return (
            <Box key={idx} textAlign="center">
              <Typography variant="caption" color="#94a3b8">
                {layer.type.toUpperCase()}
              </Typography>

              <Box display="grid" gridTemplateColumns={`repeat(${cols}, 10px)`} gap="8px" mt={1}>
                {Array.from({ length: count }).map((_, i) => {
                  const v = activations[i] ?? 0;
                  const isPred = isOutputLayer && predicted === i;

                  return (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor: `rgba(96,165,250,${0.25 + 0.75 * v})`,
                        scale: 1 + 0.4 * v,
                      }}
                      transition={{ duration: 0.15 }}
                      style={{
                        width: isOutputLayer ? 28 : 12,
                        height: isOutputLayer ? 28 : 12,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isPred ? 16 : 12,
                        fontWeight: isPred ? 'bold' : 'normal',
                        color: 'white',
                        boxShadow: isPred ? '0 0 12px rgba(0, 245, 61, 1)' : 'none',
                      }}
                    >
                      <Typography variant="body1">{isOutputLayer ? i : null}</Typography>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
