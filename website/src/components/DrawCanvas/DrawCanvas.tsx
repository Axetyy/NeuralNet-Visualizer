'use client';
import { useRef, useEffect } from 'react';
import { Box, Button, Stack } from '@mui/material';

interface DrawCanvasProps {
  onPredict: (pixels: number[]) => void;
  sensitivity: number;
  brushSize: number;
}

export const DrawCanvas: React.FC<DrawCanvasProps> = ({ onPredict, sensitivity, brushSize }) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

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
    ctx.fillStyle = `rgba(255,255,255,${sensitivity})`;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    const displayCtx = displayCanvasRef.current!.getContext('2d')!;
    displayCtx.drawImage(canvas, 0, 0, 280, 280, 0, 0, 280, 280);
    clearPreview();
  };
  const drawPreview = (e: React.MouseEvent) => {
    const previewCanvas = previewCanvasRef.current!;
    const ctx = previewCanvas.getContext('2d')!;

    const rect = previewCanvas.getBoundingClientRect();
    const scale = previewCanvas.width / rect.width;

    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
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
  const clearPreview = () => {
    const ctx = previewCanvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, 280, 280);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Box sx={{ position: 'relative' }}>
        <canvas
          ref={displayCanvasRef}
          width={280}
          height={280}
          onMouseMove={(e) => {
            drawPreview(e);
            if (e.buttons === 1) draw(e);
          }}
          onMouseLeave={clearPreview}
          style={{
            border: '1px solid #444',
            imageRendering: 'pixelated',
            background: 'black',
          }}
        />

        <canvas
          ref={previewCanvasRef}
          width={280}
          height={280}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        />

        <canvas ref={drawCanvasRef} width={280} height={280} style={{ display: 'none' }} />
      </Box>

      <Stack direction="row" spacing={2}>
        <Button onClick={predict} variant="contained" color="secondary">
          Predict
        </Button>
        <Button onClick={clear} variant="contained" color="secondary">
          Clear
        </Button>
      </Stack>
      <Box height="20px" />
    </Stack>
  );
};
