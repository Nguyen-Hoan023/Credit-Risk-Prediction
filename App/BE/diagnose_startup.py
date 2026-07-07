import traceback
import sys

print("=== NovaBank Backend Diagnostics ===")
print("Python executable:", sys.executable)
print("Python version:", sys.version)

try:
    print("\n1. Importing dependencies...")
    import fastapi
    print("   fastapi: ok")
    import pydantic
    print("   pydantic: ok")
    import joblib
    print("   joblib: ok")
    import pandas as pd
    print("   pandas: ok")
    import numpy as np
    print("   numpy: ok")
    import lightgbm
    print("   lightgbm: ok")
    import sklearn
    print("   sklearn: ok")
except Exception as e:
    print("\nIMPORT ERROR:")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n2. Importing project modules...")
    from schema import PredictRequest
    print("   schema: ok")
    from preprocessors import GroupMedianImputer, CategoricalCaster
    print("   preprocessors: ok")
    from model import load_artifacts, get_pipeline, is_loaded
    print("   model: ok")
    from preprocess import build_feature_dataframe
    print("   preprocess: ok")
    from scoring import prob_to_score
    print("   scoring: ok")
except Exception as e:
    print("\nPROJECT IMPORT ERROR:")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n3. Loading pipeline artifact...")
    load_artifacts()
    print("Artifact loaded successfully!")
    
    # Test pipeline access
    print("\n4. Testing pipeline access...")
    pipeline = get_pipeline()
    print("   Pipeline type:", type(pipeline))
    print("   Pipeline steps:", [name for name, _ in pipeline.steps])
    print("Diagnosis complete. Everything seems fine!")
except Exception as e:
    print("\nSTARTUP ERROR:")
    traceback.print_exc()
    sys.exit(1)
