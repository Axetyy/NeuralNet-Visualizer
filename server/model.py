import torch
import torch.nn as nn


class FashionMNIST(nn.Module):
    def __init__(self):
        super().__init__()
        
        self.conv1 = nn.Conv2d(1,16,kernel_size=3,padding=1)
        self.relu1 = nn.ReLU()
        self.pool1 = nn.MaxPool2d(2)
        
        self.conv2 = nn.Conv2d(16,32,kernel_size=3,padding=1)
        self.relu2 = nn.ReLU()
        self.pool2 = nn.MaxPool2d(2)
        
        self.conv3 = nn.Conv2d(32,64,kernel_size=3,padding=1)
        self.relu3 = nn.ReLU()
        
        self.gap = nn.AdaptiveAvgPool2d((1,1))
        self.fc = nn.Linear(64,10)
    
    def forward(self, x):
        x = self.pool1(self.relu1(self.conv1(x)))
        x = self.pool2(self.relu2(self.conv2(x)))
        x = self.relu3(self.conv3(x))
        x = self.gap(x)
        x = torch.flatten(x, 1)
        return self.fc(x)
    
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