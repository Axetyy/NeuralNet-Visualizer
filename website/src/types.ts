type ModelLayerType = 'linear' | 'relu' | 'sigmoid';

export type ModelConfig = {
  layers: ModelLayer[];
  optimizer: string;
  lr: number;
  epochs: number;
};
export type ModelLayer = {
  type: ModelLayerType;
  in?: number;
  out?: number;
};
