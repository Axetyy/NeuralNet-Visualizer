import torch
import torch.nn as nn

class DynamicModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.layers = nn.ModuleList()
        for layer_cfg in config:
            if layer_cfg['type'] == 'linear':
                self.layers.append(nn.Linear(layer_cfg['in'], layer_cfg['out']))
            elif layer_cfg['type'] == 'relu':
                self.layers.append(nn.ReLU())
            elif layer_cfg['type'] == 'sigmoid':
                self.layers.append(nn.Sigmoid())

    def forward(self, x):
        for layer in self.layers:
            x = layer(x)
        return x