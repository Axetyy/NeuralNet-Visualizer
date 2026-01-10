import { ModelLayer } from '<@>/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateModel = (layers: ModelLayer[], setNotification: (value: any) => void) => {
  const firstLayer = layers[0];
  const lastLayer = layers[layers.length - 1];

  if (firstLayer.type !== 'linear' || firstLayer.in !== 784) {
    setNotification({
      open: true,
      message:
        "Failsafe Triggered: The first layer must be a Linear layer with an 'In' size of 784 (MNIST input).",
      severity: 'error',
    });
    return false;
  }

  if (lastLayer.type !== 'linear' || lastLayer.out !== 10) {
    setNotification({
      open: true,
      message:
        "Failsafe Triggered: The final layer must be a Linear layer with an 'Out' size of 10 (Digits 0-9).",
      severity: 'error',
    });
    return false;
  }

  return true;
};
