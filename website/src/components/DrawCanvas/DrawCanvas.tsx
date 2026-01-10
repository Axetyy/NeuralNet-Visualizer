'use client';
import { useRef, useEffect } from 'react';
import { Box, Button, Stack } from '@mui/material';

interface DrawCanvasProps {
  onPredict: (pixels: number[]) => void;
  sensitivity: number;
}

export const DrawCanvas: React.FC<DrawCanvasProps> = ({ onPredict, sensitivity }) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = drawCanvasRef.current!.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 280, 280);
  }, []);

  const draw = (e: React.MouseEvent) => {
    const canvas = drawCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const rect = displayCanvasRef.current!.getBoundingClientRect();
    const scale = canvas.width / rect.width;

    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    const size = 20 * sensitivity;
    ctx.fillStyle = `rgba(255,255,255,${sensitivity})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    const displayCtx = displayCanvasRef.current!.getContext('2d')!;
    displayCtx.drawImage(canvas, 0, 0, 280, 280, 0, 0, 280, 280);
  };

  const predict = () => {
    const drawCanvas = drawCanvasRef.current!;
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = 28;
    smallCanvas.height = 28;

    const smallCtx = smallCanvas.getContext('2d')!;
    smallCtx.drawImage(drawCanvas, 0, 0, 28, 28);

    const img = smallCtx.getImageData(0, 0, 28, 28).data;

    const pixels = [];
    for (let i = 0; i < img.length; i += 4) {
      pixels.push(img[i] / 255.0);
    }

    onPredict(pixels);
  };

  const clear = () => {
    const ctx = drawCanvasRef.current!.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 280, 280);

    const displayCtx = displayCanvasRef.current!.getContext('2d')!;
    displayCtx.clearRect(0, 0, 280, 280);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <canvas
        ref={displayCanvasRef}
        width={280}
        height={280}
        onMouseMove={(e) => e.buttons === 1 && draw(e)}
        style={{
          border: '1px solid #444',
          imageRendering: 'pixelated',
          background: 'black',
        }}
      />

      <canvas ref={drawCanvasRef} width={280} height={280} style={{ display: 'none' }} />

      <Stack direction="row" spacing={2}>
        <Button onClick={predict} variant="contained" color="primary">
          Predict
        </Button>
        <Button onClick={clear} variant="contained" color="primary">
          Clear
        </Button>
      </Stack>
      <Box height="20px" />
    </Stack>
  );
};
