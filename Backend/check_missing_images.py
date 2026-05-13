import os
import sys

# Setup path so we can import from app
sys.path.append(os.path.join(os.getcwd(), 'Backend'))

from app import create_app
from extensions import db
from models.product_model import Product

app = create_app()

with app.app_context():
    products = Product.query.all()
    missing_images = [p.name for p in products if not p.image_url]
    print(f"Total products: {len(products)}")
    print(f"Products missing images: {len(missing_images)}")
    for name in missing_images:
        print(f"- {name}")
