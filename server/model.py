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
    
    
    
class PretrainedModel(nn.Module):
    def __init__(self,num_classes):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784,1024),
            nn.ReLU(),
            nn.BatchNorm1d(1024),
            nn.Linear(1024,512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Linear(512,256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Linear(256,128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Linear(128,num_classes),
        )

    def forward(self,X):
        return self.layers(X)