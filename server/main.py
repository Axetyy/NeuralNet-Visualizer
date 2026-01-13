import uvicorn
import os;
from asyncio.log import logger
import torch
import torch.nn as nn
import torch.optim as optim
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from model import DynamicModel,PretrainedModel,FashionMNIST
from torchvision import datasets,transforms

from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
state_dict = torch.load(
    'cnn_weights.pth',
    map_location='cpu',
    weights_only=True
)

cnn_model = FashionMNIST()
incompatible = cnn_model.load_state_dict(state_dict)
cnn_model.eval()


state = {
    'model': None,
    'optimizer':None,
    'criterion':nn.CrossEntropyLoss(),
    'activations':{},
    'gradients':{},
    'epochs':10,
    'batch_size':32,
    'send_every':32,
    'ws_sleep':0.01,
}
viz_cache = {"layers":[]}


def register_hooks(model):
    def forward_hooks(name, is_input=False):
        def hook(module, input, output):
            if is_input:
                val = input[0].detach() 
                first_sample = val[0]   
                normalized = (first_sample.abs() / (first_sample.abs().max() + 1e-6)).tolist()
                if len(normalized) < 784:
                    normalized = normalized + [0.0] * (784 - len(normalized))
                elif len(normalized) > 784:
                    normalized = normalized[:784]
            else:
                val = output.detach()   
                first_sample = val[0]
                normalized = (first_sample.abs() / (first_sample.abs().max() + 1e-6)).tolist()
            state['activations'][name] = normalized
        return hook

    def backward_hooks(name, is_input=False):
        def hook(module, grad_input, grad_output):
            val = grad_output[0].detach() 
            if is_input:
                first_sample_grad = val[0]
                normalized_grad = (first_sample_grad.abs() / (first_sample_grad.abs().max() + 1e-6)).tolist()
                if len(normalized_grad) < 784:
                    normalized_grad = normalized_grad + [0.0] * (784 - len(normalized_grad))
                elif len(normalized_grad) > 784:
                    normalized_grad = normalized_grad[:784]
            else:
                first_sample_grad = val[0]
                normalized_grad = (first_sample_grad.abs() / (first_sample_grad.abs().max() + 1e-6)).tolist()
            state['gradients'][name] = normalized_grad
        return hook

    for idx, layer in enumerate(model.layers if hasattr(model, 'layers') else model.children()):
        layer_name = f"layer_{idx}"
        is_input = (idx == 0)
        layer.register_forward_hook(forward_hooks(layer_name, is_input))
        layer.register_full_backward_hook(backward_hooks(layer_name, is_input))


hooks_registered = False

def register_CNN_hooks(model):
    global hooks_registered
    if hooks_registered:
        return
    hooks_registered = True

    def hook_fn(name):
        def hook(module, input, output):
            activations = output.detach().cpu()[0]
            a_min = activations.min()
            a_max = activations.max()

            norm = (activations - a_min) / (a_max - a_min + 1e-6)

            viz_cache['layers'].append({
                'name': name,
                'type': module.__class__.__name__,
                'shape': list(activations.shape),
                'values': norm.flatten().tolist(),
                'stats': {
                    'max_val': float(a_max),
                    'channels': activations.shape[0],
                    'resolution': activations.shape[1],
                }
            })
        return hook

    for name, module in model.named_modules():
        if isinstance(module, (nn.Conv2d)):
            module.register_forward_hook(hook_fn(name))

class LayerConfig(BaseModel):
    type: str
    in_features: Optional[int] = None
    out_features: Optional[int] = None

class SetupConfig(BaseModel):
    layers: List[dict]
    optimizer: str
    lr: float
    epochs: int
    batch_size: int
    send_every:int
    ws_sleep:float
    
class DrawRequest(BaseModel):
    pixels: List[float]

@app.post('/setup')
async def setup_model(config: SetupConfig):
    
    state['activations'].clear()
    state['gradients'].clear()
    state.pop('loss_ema', None)

    opt_map={
        "Adam": torch.optim.Adam,
        "SGD": torch.optim.SGD,
        "RMSprop": torch.optim.RMSprop
    }
    layers_data = config.layers
    state['model'] = DynamicModel(layers_data)
    
    optim_class = opt_map.get(config.optimizer, torch.optim.Adam)
    state['optimizer'] = optim_class(state['model'].parameters(), lr=config.lr)
    
    state['epochs'] = config.epochs
    state['batch_size'] = config.batch_size
    state['send_every'] = config.send_every
    state['ws_sleep'] = config.ws_sleep
    
    register_hooks(state['model'])
    
    print(f"Model initialized with {config.optimizer} and LR {config.lr}")
    return {'status': 'model setup complete'}

@app.websocket('/ws/train')
async def train_stream(websocket:WebSocket):
    await websocket.accept()
    
    train_transform = transforms.Compose([transforms.ToTensor(),transforms.Lambda(lambda x: x.flatten()),transforms.Lambda(lambda x : x/255.0)])
    train_set = datasets.MNIST('./data',train=True,download=True,transform=train_transform)
    
    train_loader = torch.utils.data.DataLoader(train_set,batch_size=state['batch_size'],shuffle=True)
    for epoch in range(state['epochs']):
        for batch_idx, (data, target) in enumerate(train_loader):
            state['optimizer'].zero_grad()
            output = state['model'](data)
            loss = state['criterion'](output, target)
            loss.backward()
            state['optimizer'].step()

            if 'loss_ema' not in state:
                state['loss_ema'] = loss.item()
            else:
                state['loss_ema'] = 0.9 * state['loss_ema'] + 0.1 * loss.item()

            predicted = output.argmax(dim=1)[0].item()
            trueLabel = target[0].item()
            accuracy = (output.argmax(dim=1) == target).float().mean().item()

            send = (batch_idx % state['send_every'] == 0) or (batch_idx == len(train_loader) - 1)
            if send:
                layer_keys = sorted(state['activations'].keys())
                payload = {
                    "epoch": epoch,
                    "batch": batch_idx,
                    "loss": round(state['loss_ema'], 4),
                    "forward_wave": [state['activations'].get(k, [0.0]) for k in layer_keys],
                    "backward_wave": [state['gradients'].get(k, [0.0]) for k in layer_keys],
                    "predicted": predicted,
                    "trueLabel": trueLabel,
                    "accuracy": accuracy,
                }
                await websocket.send_text(json.dumps(payload))
                await asyncio.sleep(state['ws_sleep'])
    await websocket.close()

@app.post("/draw")
async def draw_model(payload: List[float]):
    img = torch.tensor(payload, dtype=torch.float32).view(1, 784)

    state['activations']={}
    state['gradients']={}

    model = PretrainedModel(10)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    weights_path = os.path.join(os.getcwd(),'model_weights.pth')
    model.load_state_dict(torch.load(
        weights_path, 
        map_location=device, 
        weights_only=True
    ))
    
    model.to(device)
    model.eval()

    register_hooks(model) 

    with torch.no_grad():
        img = img.to(device)
        output = model(img)

    predicted = torch.argmax(output,dim=1).item()
    layer_keys = [f"layer_{i}" for i in range(len(model.layers))]

    return {
        "forward_wave": [state['activations'].get(k, []) for k in layer_keys],
        "predicted": predicted,
    }
    

@app.post('/inference/cnn')
async def inference_cnn(payload:List[float]):
    cnn_model.eval()
    register_CNN_hooks(cnn_model)
    viz_cache['layers']= []
    input_tensor = torch.tensor(payload).view(1,1,28,28)
    with torch.no_grad():
        logits = cnn_model(input_tensor)
        probabilities = torch.softmax(logits,dim=1)
        pred = torch.argmax(logits,dim=1).item()
    return {
        'prediction' : pred,
        'confidence' : probabilities.cpu().numpy().tolist(),
        'trace':viz_cache['layers']
    }


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)