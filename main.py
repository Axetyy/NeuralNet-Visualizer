from asyncio.log import logger
import torch
import torch.nn as nn
import torch.optim as optim
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from model import DynamicModel
from torchvision import datasets,transforms
import json
import asyncio


app = FastAPI()
app.add_middleware(CORSMiddleware,allow_origins=['*'])

state = {
    'model': None,
    'optimizer':None,
    'criterion':nn.CrossEntropyLoss(),
    'activations':{},
    'gradients':{},
    'epochs':10,
    'batch_size':32,
}

def register_hooks(model):
    def forward_hooks(name):
        def hook(module,input,output):
            state['activations'][name] = output.detach().abs().mean().item()
        return hook
    def backward_hooks(name):
        def hook(module,grad_input,grad_output):
            state['gradients'][name] = grad_output[0].detach().abs().mean().item()
        return hook
    for idx, layer in enumerate(model.layers):
        layer_name = f"layer_{idx}"
        layer.register_forward_hook(forward_hooks(layer_name))
        layer.register_full_backward_hook(backward_hooks(layer_name))
        
        
@app.post('/setup')
async def setup_model(config:dict):
    state['model'] = DynamicModel(config['layers'])
    state['optimizer'] = config['optimizer'](state['model'].parameters(),lr=config['lr'])
    register_hooks(state['model'])
    logger.info('Model and optimzier set up')
    return {'status':'model setup complete'}

@app.websocket('/ws/train')
async def train_stream(websocket:WebSocket):
    await websocket.accept()
    
    train_transform = transforms.compose([transforms.toTensor(),transforms.Lambda(lambda x: x.flatten()/255.0)])
    train_set = datasets.MNIST('./data',train=True,download=True,transform=train_transform)
    
    train_loader = torch.utils.data.DataLoader(train_set,batch_size=state['batch_size'],shuffle=True)
    for epoch in range(state['epochs']):
        for batch_idx,(data,target) in enumerate(train_loader):
            state['optimizer'].zero_grad()
            output = state['model'](data)
            loss = state['criterion'](output,target)
            loss.backward()
            state['optimizer'].step()
            
            layer_keys = sorted(state['activations'].keys())
            payload = {
                "batch":batch_idx,
                'loss':round(loss.item(),4),
                'forward_wave':[state['activations'].get(k,0) for k in layer_keys],
                'backward_wave':[state['gradients'].get(k,0) for k in reversed(layer_keys)]
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.01)

@app.post("/draw")
async def draw_model(payload:dict):
    img = torch.tensor(payload).view(1,784)
    activations = []
    x = img
    for layer in state['model'].layers:
        x = layer(x)
        if isinstance(layer,nn.Linear):
            activations.append(x.detach().squeeze().tolist())
    return {'pred_probabilities':torch.softmax(x,dim=1), 'activations':activations}

if __name__ == '__main__':
    import uvicorn 
    uvicorn.run(app,host='0.0.0.0',port=8000)