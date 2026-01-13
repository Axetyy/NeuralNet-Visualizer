import * as THREE from 'three';
import { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { Paper, Typography } from '@mui/material';

interface FeatureSlabProps {
  values: number[];
  shape: number[];
  name: string;
  type: string;
  index: number;
  mode?: 'line' | 'grid';
  threshold?: number;
  scale?: number;
  spacing: number;
}

export const FeatureSlab: React.FC<FeatureSlabProps> = ({
  values,
  shape,
  name,
  type,
  index,
  mode,
  threshold = 20,
  scale = 1,
  spacing,
}) => {
  const [channels, height, width] = shape;
  const [isExpanded, setIsExpanded] = useState(false);

  const textures = useMemo(() => {
    const texs: THREE.DataTexture[] = [];
    const size = width * height;

    for (let c = 0; c < channels; c++) {
      const channelOffset = c * size;
      const data = new Uint8Array(size * 4);

      for (let i = 0; i < size; i++) {
        const value = values[channelOffset + i];
        const intensity = Math.floor(value * 255);

        const r = i * 4;
        data[r] = intensity;
        data[r + 1] = intensity;
        data[r + 2] = intensity;
        data[r + 3] = 255;
      }

      const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
      tex.magFilter = THREE.NearestFilter;
      tex.flipY = true;
      tex.needsUpdate = true;
      texs.push(tex);
    }

    return texs;
  }, [values, width, height, channels]);

  const useGrid = mode ? mode === 'grid' : channels > threshold;
  const gridSize = useGrid ? Math.ceil(Math.sqrt(channels)) : channels;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
      }}
    >
      <Html
        distanceFactor={12}
        position={[0, (height / 4) * scale + 1, -1]}
        center
        transform
        rotation={[0, Math.PI, 0]}
      >
        <Paper
          elevation={10}
          sx={{
            p: 1,
            minWidth: 100,
            bgcolor: 'rgba(10, 15, 30, 0.9)',
            border: `1px solid ${isExpanded ? '#c084fc' : '#60a5fa'}`,
            color: 'white',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
          }}
        >
          <Typography
            variant="caption"
            fontWeight={900}
            sx={{ display: 'block', color: isExpanded ? '#c084fc' : '#60a5fa' }}
          >
            {name.toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: '0.5rem', opacity: 0.7 }}>
            {channels}×{height}×{width}
          </Typography>
        </Paper>
      </Html>

      {textures.map((tex, i) => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        const xSpace = (width / 3.5) * spacing;
        const ySpace = (height / 3.5) * spacing;

        return (
          <mesh
            key={i}
            position={[
              isExpanded ? (col - (gridSize - 1) / 2) * xSpace : 0,
              isExpanded && useGrid ? (row - (gridSize - 1) / 2) * -ySpace : 0,
              isExpanded ? 0 : i * 0.1,
            ]}
          >
            <planeGeometry args={[(width / 4) * scale, (height / 4) * scale]} />
            <meshStandardMaterial
              map={tex}
              transparent
              side={THREE.DoubleSide}
              emissive={'#111111'}
              emissiveIntensity={1}
            />
          </mesh>
        );
      })}

      {!isExpanded && (
        <mesh position={[0, 0, (textures.length * 0.1) / 2]}>
          <boxGeometry
            args={[(width / 4) * scale + 0.1, (height / 4) * scale + 0.1, textures.length * 0.1]}
          />
          <meshBasicMaterial wireframe color="#60a5fa" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
};
