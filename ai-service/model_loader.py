"""
Custom model loader for Keras 2.15 / TF 2.x.

The saved .h5 models were serialised with an older Keras that used:
  - 'batch_shape': [None, H, W, C]  in InputLayer config  (Keras 1.x / 2.x style)
  
Keras 2.15 still uses the legacy loader for .h5 files but the functional model
process_node reads inbound_nodes and expects a TensorShape, not a raw list.

The cleanest fix is to patch the model_config JSON stored in the h5 file
IN MEMORY before passing it to Keras for reconstruction.
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import json
import numpy as np
import tensorflow as tf
import keras

# ──────────────────────────────────────────────────────────────────────────────
# Patch BatchNormalization to silently drop 'synchronized'
# ──────────────────────────────────────────────────────────────────────────────
try:
    from keras.layers import BatchNormalization as _BaseBN
    _orig_bn_init = _BaseBN.__init__

    def _patched_bn_init(self, *args, **kwargs):
        kwargs.pop('synchronized', None)
        _orig_bn_init(self, *args, **kwargs)

    _BaseBN.__init__ = _patched_bn_init
    print("[OK] BatchNormalization compatibility patch applied")
except Exception as e:
    print(f"[WARN] BatchNormalization patch skipped: {e}")


def _fix_layer_config(layer_config):
    """Recursively fix layer configs that contain old-style keys."""
    if not isinstance(layer_config, dict):
        return layer_config

    # Fix InputLayer batch_shape -> batch_input_shape
    if layer_config.get('class_name') == 'InputLayer':
        cfg = layer_config.get('config', {})
        if 'batch_shape' in cfg:
            cfg['batch_input_shape'] = cfg.pop('batch_shape')
        cfg.pop('optional', None)
        layer_config['config'] = cfg

    # Fix Dense layer quantization_config error
    if layer_config.get('class_name') == 'Dense':
        cfg = layer_config.get('config', {})
        cfg.pop('quantization_config', None)
        layer_config['config'] = cfg

    # Recurse into nested layer configs
    for key, value in layer_config.items():
        if isinstance(value, dict):
            layer_config[key] = _fix_layer_config(value)
        elif isinstance(value, list):
            layer_config[key] = [
                _fix_layer_config(v) if isinstance(v, dict) else v
                for v in value
            ]

    return layer_config


def _fix_model_config(model_config_str):
    """Parse, fix and re-serialise the model config JSON string."""
    config = json.loads(model_config_str)

    # Handle both Sequential and Functional models
    if 'config' in config and 'layers' in config['config']:
        config['config']['layers'] = [
            _fix_layer_config(l) for l in config['config']['layers']
        ]

    return json.dumps(config)


def load_model_safe(model_path, compile=False):
    """
    Load a Keras .h5 model, patching the stored model_config to fix
    the batch_shape key that newer Keras versions do not accept.
    """
    import h5py

    print(f"[INFO] Loading model from: {model_path}")

    # -- Step 1: Open the h5 file and patch the model_config in place --------
    try:
        with h5py.File(model_path, 'r+') as f:
            if 'model_config' in f.attrs:
                original_cfg = f.attrs['model_config']
                fixed_cfg = _fix_model_config(original_cfg)
                if fixed_cfg != original_cfg:
                    f.attrs['model_config'] = fixed_cfg
                    print("[OK] Patched model_config in h5 file (batch_shape -> batch_input_shape)")
    except Exception as patch_err:
        print(f"[WARN] Could not patch h5 file (may be read-only): {patch_err}")

    # In Keras 2.15, DTypePolicy = mixed_precision.Policy
    custom_objects = {}
    try:
        from keras.mixed_precision import Policy
        custom_objects['DTypePolicy'] = Policy
        custom_objects['Policy'] = Policy
    except Exception:
        pass

    # -- Step 2: Load the (now-patched) model --------------------------------
    try:
        with keras.utils.custom_object_scope(custom_objects):
            model = keras.models.load_model(model_path, compile=compile)
        print(f"[OK] Model loaded successfully: {model_path}")
        return model
    except Exception as e1:
        print(f"[WARN] First load attempt failed: {e1}")

    try:
        with tf.keras.utils.custom_object_scope(custom_objects):
            model = tf.keras.models.load_model(model_path, compile=compile)
        print(f"[OK] Model loaded (tf.keras path): {model_path}")
        return model
    except Exception as e2:
        print(f"[ERROR] Both load attempts failed for {model_path}: {e2}")
        raise e2
