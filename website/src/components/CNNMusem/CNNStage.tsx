import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import { FeatureSlab } from './FeatureSlab';
import { CNNLayer } from '<@>/types';
import { Box, Paper } from '@mui/material';

interface CNNStageProps {
  trace: CNNLayer[];
  threshold: number;
  scale: number;
  spacing: number;
  distance:number
}

export const CNNStage: React.FC<CNNStageProps> = ({ trace, threshold, scale, spacing,distance}) => {
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 15, -40]} fov={45} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxDistance={200}
          minDistance={5}
          enablePan={true}
        />
        <ambientLight intensity={1.5} />
        <pointLight position={[20, 20, -20]} intensity={2} />

        <group position={[0, 0, 0]}>
          {trace.map((layer, index) => (
            <group key={index} position={[0, 0, index * distance]}>
              <FeatureSlab
                values={layer.values}
                shape={layer.shape}
                name={layer.name}
                type={layer.type}
                index={index}
                threshold={threshold}
                scale={scale}
                spacing={spacing/2}
              />
            </group>
          ))}
        </group>
      </Canvas>
    </Box>
  );
};
