import os
import sys

project_root = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', '..'))
print(project_root)
sys.path.append(project_root)
