import os
import sys
from waitress import serve

# Add Backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Backend'))

from app import app

if __name__ == "__main__":
    print("🚀 Starting AgroHub Production Server (Local)...")
    print("🔗 API and Frontend served at: http://127.0.0.1:8080")
    print("Press Ctrl+C to stop.")
    
    # Run using Waitress (Production-grade for Windows)
    serve(app, host='0.0.0.0', port=8080)
