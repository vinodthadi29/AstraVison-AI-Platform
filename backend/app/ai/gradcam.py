"""Grad-CAM (Gradient-weighted Class Activation Mapping) Service for model explainability"""

import logging
import numpy as np
import cv2
from pathlib import Path
from typing import Tuple, Optional
import torch
import torch.nn.functional as F
from PIL import Image as PILImage
from torchvision import transforms
from torchvision.models import mobilenet_v2

logger = logging.getLogger(__name__)


class GradCAMService:
    """Service for generating Grad-CAM heatmaps for MobileNetV2 feature visualization"""
    
    _instance = None
    _model = None
    _target_layer = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Grad-CAM service"""
        self.model = None
        self.target_layer = None
        self.gradients = None
        self.activations = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.preprocessing = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def load_model(self, force_reload: bool = False):
        """
        Load MobileNetV2 model
        
        Args:
            force_reload: Force reload even if already loaded
        """
        if self.model is None or force_reload:
            logger.info("Loading MobileNetV2 model for Grad-CAM")
            try:
                self.model = mobilenet_v2(pretrained=True)
                self.model.to(self.device)
                self.model.eval()
                
                # Set target layer (last convolutional layer)
                self.target_layer = self.model.features[-1]
                
                logger.info("MobileNetV2 model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load MobileNetV2: {str(e)}")
                raise RuntimeError(f"Failed to load model: {str(e)}")
    
    def _hook_fn(self, module, input, output):
        """Hook function to capture activations and gradients"""
        self.activations = output.detach()
    
    def _backward_hook_fn(self, module, grad_input, grad_output):
        """Hook function to capture gradients"""
        self.gradients = grad_output[0].detach()
    
    def generate_heatmap(
        self,
        image_path: str,
        output_path: Optional[str] = None,
        blend_alpha: float = 0.4,
        colormap: str = 'jet'
    ) -> Tuple[np.ndarray, str]:
        """
        Generate Grad-CAM heatmap for an image
        
        Args:
            image_path: Path to input image
            output_path: Path to save heatmap image. If None, auto-generates path
            blend_alpha: Alpha value for blending heatmap with original image (0-1)
            colormap: OpenCV colormap name ('jet', 'hot', 'cool', 'viridis', etc.)
            
        Returns:
            Tuple of (heatmap_image as numpy array, output_path)
        """
        try:
            self.load_model()
            
            # Load and preprocess image
            original_image = cv2.imread(image_path)
            if original_image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            height, width = original_image.shape[:2]
            
            # Load image for preprocessing
            pil_image = PILImage.open(image_path).convert('RGB')
            input_tensor = self.preprocessing(pil_image).unsqueeze(0).to(self.device)
            
            # Register hooks
            forward_hook = self.target_layer.register_forward_hook(self._hook_fn)
            backward_hook = self.target_layer.register_full_backward_hook(self._backward_hook_fn)
            
            # Forward pass
            output = self.model(input_tensor)
            target_class = output.argmax(dim=1).item()
            
            # Backward pass
            self.model.zero_grad()
            output[0, target_class].backward()
            
            # Compute Grad-CAM
            gradients = self.gradients.cpu().numpy()[0]  # (channels, height, width)
            activations = self.activations.cpu().numpy()[0]  # (channels, height, width)
            
            # Global average pooling of gradients
            weights = np.mean(gradients, axis=(1, 2))  # (channels,)
            
            # Weighted sum of activations
            heatmap = np.zeros((activations.shape[1], activations.shape[2]))
            for i, w in enumerate(weights):
                heatmap += w * activations[i, :, :]
            
            # Apply ReLU to keep only positive activations
            heatmap = np.maximum(heatmap, 0)
            
            # Normalize to 0-1
            heatmap_max = heatmap.max()
            if heatmap_max > 0:
                heatmap = heatmap / heatmap_max
            
            # Resize to match original image
            heatmap = cv2.resize(heatmap, (width, height))
            
            # Apply colormap
            colormap_dict = {
                'jet': cv2.COLORMAP_JET,
                'hot': cv2.COLORMAP_HOT,
                'cool': cv2.COLORMAP_COOL,
                'viridis': cv2.COLORMAP_VIRIDIS,
                'plasma': cv2.COLORMAP_PLASMA,
                'turbo': cv2.COLORMAP_TURBO
            }
            cv_colormap = colormap_dict.get(colormap, cv2.COLORMAP_JET)
            
            # Convert to 8-bit for colormap
            heatmap_uint8 = (heatmap * 255).astype(np.uint8)
            heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv_colormap)
            
            # Blend with original image
            original_rgb = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)
            original_rgb = cv2.cvtColor(original_rgb, cv2.COLOR_RGB2BGR)
            
            blended = cv2.addWeighted(
                original_rgb,
                1 - blend_alpha,
                heatmap_colored,
                blend_alpha,
                0
            )
            
            # Remove hooks
            forward_hook.remove()
            backward_hook.remove()
            
            # Save heatmap if output path provided
            if output_path is None:
                # Auto-generate output path
                image_stem = Path(image_path).stem
                output_path = f"heatmaps/{image_stem}_gradcam.png"
            
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(output_path, blended)
            
            logger.info(f"Grad-CAM heatmap saved to {output_path}")
            
            return blended, output_path
            
        except Exception as e:
            logger.error(f"Error generating Grad-CAM: {str(e)}")
            raise RuntimeError(f"Failed to generate Grad-CAM heatmap: {str(e)}")
    
    def generate_heatmap_mask(
        self,
        image_path: str,
        threshold: float = 0.5
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate raw heatmap mask without coloring
        
        Args:
            image_path: Path to input image
            threshold: Threshold for binarizing heatmap (0-1)
            
        Returns:
            Tuple of (raw_heatmap, binary_mask)
        """
        try:
            self.load_model()
            
            # Load image
            pil_image = PILImage.open(image_path).convert('RGB')
            original_size = pil_image.size  # (width, height)
            
            input_tensor = self.preprocessing(pil_image).unsqueeze(0).to(self.device)
            
            # Register hooks
            forward_hook = self.target_layer.register_forward_hook(self._hook_fn)
            backward_hook = self.target_layer.register_full_backward_hook(self._backward_hook_fn)
            
            # Forward and backward pass
            output = self.model(input_tensor)
            target_class = output.argmax(dim=1).item()
            
            self.model.zero_grad()
            output[0, target_class].backward()
            
            # Compute heatmap
            gradients = self.gradients.cpu().numpy()[0]
            activations = self.activations.cpu().numpy()[0]
            weights = np.mean(gradients, axis=(1, 2))
            
            heatmap = np.sum(weights[:, np.newaxis, np.newaxis] * activations, axis=0)
            heatmap = np.maximum(heatmap, 0)
            
            # Normalize
            if heatmap.max() > 0:
                heatmap = heatmap / heatmap.max()
            
            # Resize to original size
            heatmap = cv2.resize(heatmap, original_size)
            
            # Create binary mask
            binary_mask = (heatmap > threshold).astype(np.uint8) * 255
            
            # Remove hooks
            forward_hook.remove()
            backward_hook.remove()
            
            return heatmap, binary_mask
            
        except Exception as e:
            logger.error(f"Error generating heatmap mask: {str(e)}")
            raise RuntimeError(f"Failed to generate heatmap mask: {str(e)}")


# Singleton instance
_gradcam_service = None


def get_gradcam_service() -> GradCAMService:
    """Get or create the singleton GradCAMService instance"""
    global _gradcam_service
    if _gradcam_service is None:
        _gradcam_service = GradCAMService()
    return _gradcam_service
