"""
Custom model loader with comprehensive compatibility patches for Keras 3.0+
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
import keras

# --- Compatibility patches for Keras 3 ---
try:
    from keras.layers import InputLayer, BatchNormalization
    
    # Patch InputLayer if it doesn't handle batch_shape correctly (common in some TF versions)
    _original_input_init = InputLayer.__init__
    def patched_input_init(self, *args, **kwargs):
        kwargs.pop('optional', None)
        return _original_input_init(self, *args, **kwargs)
    InputLayer.__init__ = patched_input_init
    
    # Patch BatchNormalization to handle 'synchronized' correctly across versions
    _original_bn_init = BatchNormalization.__init__
    def patched_bn_init(self, *args, **kwargs):
        kwargs.pop('synchronized', None)
        return _original_bn_init(self, *args, **kwargs)
    BatchNormalization.__init__ = patched_bn_init
    
    print("✓ Applied compatibility patches for pet health models")
except Exception as e:
    print(f"! Warning: Some patches could not be applied: {e}")

def load_model_safe(model_path, compile=False):
    """
    Load a Keras model with all compatibility patches applied
    """
    # Keras 3.0+ compatibility for DTypePolicy
    custom_objects = {}
    
    # Get the correct DTypePolicy class from Keras
    try:
        from keras.dtype_policies import DTypePolicy
        custom_objects['DTypePolicy'] = DTypePolicy
    except ImportError:
        try:
            from keras.src.dtype_policy import DTypePolicy
            custom_objects['DTypePolicy'] = DTypePolicy
        except ImportError:
            # Fallback if both fail (though 3.12.1 should have it)
            class DTypePolicyFallback: 
                def __init__(self, *args, **kwargs): pass
                @classmethod
                def from_config(cls, config): return cls()
            custom_objects['DTypePolicy'] = DTypePolicyFallback
    
    try:
        # Use native keras.models.load_model with custom_objects
        # Keras 3 handles .h5 files differently, sometimes requiring the scope for DTypePolicy
        with keras.utils.custom_object_scope(custom_objects):
            model = keras.models.load_model(model_path, compile=compile)
        return model
    except Exception as e:
        print(f"Error loading model {model_path}: {e}")
        # One last fallback: try direct load
        try:
            return keras.models.load_model(model_path, compile=compile)
        except Exception as inner_e:
            print(f"Final fallback failed: {inner_e}")
            raise e
