import os
import sys
import random

# Setup path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from models.user_model import User
from models.product_model import Product

app = create_app()

sample_data = {
    'Vegetables': [
        ('Fresh Tomato', 40.0, 'kg', 'Farm fresh red tomatoes', ''),
        ('Potato', 30.0, 'kg', 'Quality potatoes', ''),
        ('Red Onion', 50.0, 'kg', 'Fresh red onions', ''),
        ('Cabbage', 25.0, 'piece', 'Large green cabbage', ''),
        ('Carrot', 45.0, 'kg', 'Sweet orange carrots', ''),
        ('Spinach (Palak)', 20.0, 'bunch', 'Fresh leafy spinach', ''),
        ('Cauliflower', 35.0, 'piece', 'Fresh cauliflower', ''),
        ('Capsicum (Green)', 60.0, 'kg', 'Crisp green bell peppers', ''),
        ('Brinjal', 40.0, 'kg', 'Purple eggplant', ''),
        ('Green Peas', 80.0, 'kg', 'Sweet green peas', ''),
        ('Lady Finger (Bhindi)', 40.0, 'kg', 'Fresh green lady fingers', ''),
        ('Bottleguard (Lauki)', 30.0, 'piece', 'Fresh long bottleguard', '')
    ],
    'Fruits': [
        ('Apple (Fuji)', 150.0, 'kg', 'Sweet and crisp apples', ''),
        ('Banana', 60.0, 'dozen', 'Fresh yellow bananas', ''),
        ('Alphonso Mango', 300.0, 'dozen', 'Premium Alphonso Mangoes', ''),
        ('Orange', 80.0, 'kg', 'Juicy oranges', ''),
        ('Grapes', 120.0, 'kg', 'Seedless green grapes', ''),
        ('Papaya', 40.0, 'piece', 'Ripe sweet papaya', ''),
        ('Watermelon', 25.0, 'kg', 'Fresh red watermelon', ''),
        ('Pineapple', 70.0, 'piece', 'Sweet pineapple', ''),
        ('Pomegranate', 140.0, 'kg', 'Fresh pomegranate', ''),
        ('Guava', 60.0, 'kg', 'Fresh guava', '')
    ],
    'Grains': [
        ('Premium Wheat', 35.0, 'kg', 'High quality wheat grains', ''),
        ('Basmati Rice', 120.0, 'kg', 'Long grain basmati rice', ''),
        ('Bajra (Pearl Millet)', 40.0, 'kg', 'Nutritious bajra grains', ''),
        ('Jowar (Sorghum)', 45.0, 'kg', 'Healthy jowar', ''),
        ('Maize / Corn', 30.0, 'kg', 'Dried yellow maize', ''),
        ('Ragi (Finger Millet)', 60.0, 'kg', 'High calcium ragi', ''),
        ('Oats', 150.0, 'kg', 'Rolled oats', ''),
        ('Barley', 80.0, 'kg', 'Whole grain barley', ''),
        ('Quinoa', 250.0, 'kg', 'Premium white quinoa', ''),
        ('Brown Rice', 100.0, 'kg', 'Healthy unpolished brown rice', '')
    ],
    'Pulses': [
        ('Toor Dal', 160.0, 'kg', 'Unpolished Toor Dal', ''),
        ('Arhar Dal', 165.0, 'kg', 'Premium Arhar Dal', ''),
        ('Moong Dal', 120.0, 'kg', 'Yellow Moong Dal', ''),
        ('Chana Dal', 90.0, 'kg', 'Quality Chana Dal', ''),
        ('Urad Dal', 140.0, 'kg', 'White Urad Dal', ''),
        ('Masoor Dal', 110.0, 'kg', 'Red Lentils / Masoor Dal', ''),
        ('Rajma (Kidney Beans)', 150.0, 'kg', 'Red Rajma', ''),
        ('Kabuli Chana', 130.0, 'kg', 'Large White Chickpeas', ''),
        ('Green Moong', 100.0, 'kg', 'Whole Green Moong', ''),
        ('Black Eyed Peas', 110.0, 'kg', 'Lobia / Black Eyed Peas', ''),
        ('Soybeans', 90.0, 'kg', 'Protein rich Soybeans', '')
    ],
    'Spices': [
        ('Turmeric Powder', 250.0, 'kg', 'Pure Turmeric Powder', ''),
        ('Coriander Powder', 200.0, 'kg', 'Fresh Coriander Powder', ''),
        ('Amchur Powder', 180.0, 'kg', 'Dry Mango Powder', ''),
        ('Red Chilli Powder', 300.0, 'kg', 'Spicy Red Chilli Powder', ''),
        ('Black Pepper', 800.0, 'kg', 'Whole Black Pepper', ''),
        ('Cardamom (Elaichi)', 3000.0, 'kg', 'Green Cardamom', ''),
        ('Mustard Seeds', 150.0, 'kg', 'Black Mustard Seeds', '')
    ],
    'Dairy': [
        ('Fresh Cow Milk', 60.0, 'liter', 'Farm fresh cow milk', ''),
        ('Pure Desi Ghee', 800.0, 'kg', 'A2 Cow Ghee', ''),
        ('Fresh Paneer', 350.0, 'kg', 'Soft and fresh paneer', ''),
        ('Curd (Dahi)', 80.0, 'kg', 'Thick fresh curd', '')
    ]
}

def seed_database():
    with app.app_context():
        # Get or create a farmer
        farmer = User.query.filter_by(role='farmer').first()
        if not farmer:
            farmer = User(
                name='AgroHub Demo Farmer',
                email='farmer@demo.com',
                role='farmer',
                phone='9876543210'
            )
            farmer.set_password('password123')
            db.session.add(farmer)
            db.session.commit()
            print("Created Demo Farmer")

        # Clear existing products to prevent duplicates (optional, doing it for clean slate)
        # db.session.query(Product).delete()
        # db.session.commit()

        count = 0
        for category, items in sample_data.items():
            for item in items:
                name, price, unit, desc, img = item
                
                # Check if product exists
                exists = Product.query.filter_by(name=name, farmer_id=farmer.id).first()
                if not exists:
                    p = Product(
                        farmer_id=farmer.id,
                        name=name,
                        category=category,
                        price=price,
                        unit=unit,
                        description=desc,
                        image_url=img,
                        stock=random.randint(50, 500)
                    )
                    db.session.add(p)
                    count += 1
        
        db.session.commit()
        print(f"Successfully added {count} new sample products across 6 categories!")

if __name__ == '__main__':
    seed_database()
