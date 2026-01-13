import React, { useRef } from 'react';
import { Box, Grid, Card, CardActionArea, CardContent, Typography } from '@mui/material';

const LABELS = [
  'T-shirt',
  'Trouser',
  'Pullover',
  'Dress',
  'Coat',
  'Sandal',
  'Shirt',
  'Sneaker',
  'Bag',
  'Boot',
];

type ImagePickerProps = {
  onSelect: (img: number[]) => void;
};

export default function ImagePicker({ onSelect }: ImagePickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageClick = (index: number) => {
    const img = new Image();
    img.src = `/images/mnist${index}.jpg`;
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 28, 28);
      ctx.drawImage(img, 0, 0, 28, 28);

      const imageData = ctx.getImageData(0, 0, 28, 28).data;
      const grayscalePixels: number[] = [];

      for (let i = 0; i < imageData.length; i += 4) {
        grayscalePixels.push(imageData[i] / 255);
      }

      onSelect(grayscalePixels);
    };
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Select a Subject
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
        Click an image to run inference on a Fashion-MNIST sample.
      </Typography>

      <canvas ref={canvasRef} width={28} height={28} style={{ display: 'none' }} />

      <Grid container spacing={2}>
        {LABELS.map((label, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 6 }} key={i}>
            <Card
              elevation={3}
              sx={{
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea onClick={() => handleImageClick(i)}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fafafa',
                    p: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={`/images/mnist${i}.jpg`}
                    alt={label}
                    sx={{
                      width: 56,
                      height: 56,
                      imageRendering: 'pixelated',
                    }}
                  />
                </Box>

                <CardContent sx={{ py: 1.5 }}>
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    align="center"
                    color="primary.main"
                    noWrap
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
