import os
import sys

# Add the Backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Backend'))

from app import app

if __name__ == "__main__":
    app.run()
