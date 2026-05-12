import os
import sys

# Setup path so we can import from app
sys.path.append(os.path.join(os.getcwd(), 'Backend'))

from app import create_app, db
from models.product_model import Product

app = create_app()

image_mapping = {
    'tomato': 'tomato.jpg',
    'potato': 'potato.jpg',
    'onion': 'red onion.png',
    'cabbage': 'cabbage.png',
    'carrot': 'carrot.png',
    'spinach': 'spinach.png',
    'palak': 'spinach.png',
    'cauliflower': 'cauliflower.png',
    'capsicum': 'capsicum.png',
    'peas': 'green peas.png',
    'lady finger': 'lady finger.jpg',
    'bhindi': 'lady finger.jpg',
    'brinjal': 'bringal.jpg',
    'bringal': 'bringal.jpg',
    'bottleguard': 'bottleguard.jpg',
    'lauki': 'bottleguard.jpg',
    'apple': 'apple.jpg',
    'banana': 'banana.jpg',
    'mango': 'mango.jpg',
    'orange': 'orange.jpg',
    'grapes': 'grapes.png',
    'papaya': 'papaya.png',
    'watermelon': 'watermelon.jpg',
    'pineapple': 'pineapple.jpg',
    'pomegranate': 'pomegranate.png',
    'guava': 'guava.png',
    'wheat': 'wheat.jpg',
    'atta': 'atta.png',
    'rice': 'rice.jpg',
    'bajra': 'bajra.png',
    'jowar': 'jowar.png',
    'maize': 'maize.png',
    'corn': 'maize.png',
    'ragi': 'ragi.png',
    'barley': 'barley.png',
    'oats': 'oats.jpg',
    'toor dal': 'toor dal.jpg',
    'arhar dal': 'arhar dal.jpg',
    'moong dal': 'moong dal.jpg',
    'chana dal': 'chana dal.jpg',
    'urad dal': 'urad_dal.png',
    'masoor dal': 'masoor_dal.png',
    'rajma': 'rajma.png',
    'soyabean': 'soyabean.jpg',
    'soybeans': 'soyabean.jpg',
    'turmeric': 'turmaric powder.jpg',
    'haldi': 'turmaric powder.jpg',
    'coriander': 'coriander.jpg',
    'amchur': 'amchur powder.webp',
    'red chilli': 'red chilli powder.jpeg',
    'black pepper': 'black_pepper.png',
    'cardamom': 'cardamom.png',
    'elaichi': 'cardamom.png',
    'mustard seeds': 'mustard_seeds.png',
    'milk': 'milk.jpg',
    'ghee': 'ghee.png',
    'butter': 'butter.png',
    'paneer': 'paneer.jpg',
    'curd': 'curd.png',
    'dahi': 'curd.png',
    'quinoa': 'quinoa.png',
    'brown rice': 'brown_rice.png',
    'kabuli chana': 'kabuli_chana.png',
    'green moong': 'green_moong.png',
    'black eyed peas': 'black_eyed_peas.png',
    'lobia': 'black_eyed_peas.png'
}

def update_images():
    with app.app_context():
        products = Product.query.all()
        updated_count = 0
        
        for p in products:
            name_lower = p.name.toLowerCase() if hasattr(p.name, 'toLowerCase') else p.name.lower()
            found = False
            for key, img in image_mapping.items():
                if key in name_lower:
                    p.image_url = img
                    updated_count += 1
                    found = True
                    break
            
            if not found:
                print(f"No image found for: {p.name}")
        
        db.session.commit()
        print(f"Successfully updated {updated_count} products with image URLs.")

if __name__ == '__main__':
    update_images()
