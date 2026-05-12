from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt, mail
from werkzeug.security import generate_password_hash

# --- Import Models to register with SQLAlchemy metadata ---
from models.user_model import User
from models.product_model import Product
from models.order_model import Order, Payment
from models.review_model import Review
from models.delivery_model import Delivery
from models.notification_model import Notification


def _seed_sample_products():
    """Insert demo data if DB is empty."""
    if User.query.first() is None:
        demo_farmer = User(
            name='Ramesh Kumar',
            email='farmer@agrohub.com',
            password_hash=generate_password_hash('password123'),
            role='farmer',
            phone='9876543210',
            address='Village Rampur, Haryana, India',
            referral_code='AHFARMER1',
            farm_location='Rampur, Haryana',
            farming_type='Organic',
            crops_category='Vegetables,Grains,Fruits',
            quantity_available='500 kg assorted',
            upi_id='ramesh@upi',
            preferred_language='hindi',
            rating=4.5,
            rating_count=12,
        )
        db.session.add(demo_farmer)

        demo_customer = User(
            name='Priya Sharma',
            email='customer@agrohub.com',
            password_hash=generate_password_hash('password123'),
            role='customer',
            phone='9123456789',
            address='Flat 4B, Andheri West, Mumbai',
            referral_code='AHCUST001',
            preferred_language='english',
            payment_method='upi',
        )
        db.session.add(demo_customer)

        demo_delivery = User(
            name='Suresh Delivery (Demo Rider)',
            email='delivery@agrohub.com',
            password_hash=generate_password_hash('password123'),
            role='delivery',
            phone='9988776655',
            referral_code='AHDELIV01',
            vehicle_type='Bike',
            license_number='MH01AB1234',
            availability_status='online',
            rating=4.2,
            rating_count=8,
        )
        db.session.add(demo_delivery)
        db.session.flush()

        sample_products = [
            Product(farmer_id=demo_farmer.id, name='Fresh Tomatoes',    category='Vegetables',
                    price=45.00, stock=200, unit='kg',
                    description='Organically grown red tomatoes, freshly harvested.'),
            Product(farmer_id=demo_farmer.id, name='Basmati Rice',      category='Grains',
                    price=120.00, stock=500, unit='kg',
                    description='Premium long-grain Basmati rice from Punjab farms.'),
            Product(farmer_id=demo_farmer.id, name='Alphonso Mangoes',  category='Fruits',
                    price=350.00, stock=80,  unit='dozen',
                    description='Sweet Alphonso mangoes from Ratnagiri.'),
            Product(farmer_id=demo_farmer.id, name='Spinach Bunch',     category='Vegetables',
                    price=25.00, stock=150, unit='bunch',
                    description='Fresh green spinach, pesticide-free.'),
            Product(farmer_id=demo_farmer.id, name='Turmeric Powder',   category='Spices',
                    price=90.00, stock=100, unit='kg',
                    description='Pure organic turmeric from Kerala.'),
            Product(farmer_id=demo_farmer.id, name='Moong Dal',         category='Pulses',
                    price=110.00, stock=300, unit='kg',
                    description='Yellow moong dal, sun-dried and stone-cleaned.'),
            Product(farmer_id=demo_farmer.id, name='Desi Butter',       category='Dairy',
                    price=60.00, stock=100, unit='pack',
                    description='Pure desi cow butter, chilled fresh daily.'),
            Product(farmer_id=demo_farmer.id, name='Red Onions',        category='Vegetables',
                    price=35.00, stock=300, unit='kg',
                    description='Fresh red onions, farm direct.'),
            Product(farmer_id=demo_farmer.id, name='Green Cardamom',    category='Spices',
                    price=180.00, stock=50,  unit='100g',
                    description='Premium Kerala green cardamom pods.'),
            Product(farmer_id=demo_farmer.id, name='Sweet Corn',        category='Vegetables',
                    price=40.00, stock=120, unit='dozen',
                    description='Golden sweet corn, farm fresh.'),
            Product(farmer_id=demo_farmer.id, name='Fresh Milk',        category='Dairy',
                    price=55.00, stock=200, unit='liter',
                    description='Pure cow milk, delivered fresh every morning.'),
            Product(farmer_id=demo_farmer.id, name='Wheat Flour (Atta)', category='Grains',
                    price=45.00, stock=400, unit='kg',
                    description='Stone-ground whole wheat flour.'),
            Product(farmer_id=demo_farmer.id, name='Amchur Powder',     category='Spices',
                    price=150.00, stock=50,  unit='kg',
                    description='Tangy dried mango powder.'),
            Product(farmer_id=demo_farmer.id, name='Fresh Apples',      category='Fruits',
                    price=180.00, stock=100, unit='kg',
                    description='Crunchy red apples from Himachal.'),
            Product(farmer_id=demo_farmer.id, name='Arhar Dal',         category='Pulses',
                    price=140.00, stock=200, unit='kg',
                    description='Protein-rich arhar dal (Toor dal).'),
            Product(farmer_id=demo_farmer.id, name='Ripe Bananas',      category='Fruits',
                    price=60.00,  stock=150, unit='dozen',
                    description='Fresh yellow bananas from Jalgaon.'),
            Product(farmer_id=demo_farmer.id, name='Bottle Guard',      category='Vegetables',
                    price=30.00,  stock=100, unit='kg',
                    description='Fresh and tender Lauki (Bottle Guard).'),
            Product(farmer_id=demo_farmer.id, name='Brinjal',           category='Vegetables',
                    price=40.00,  stock=120, unit='kg',
                    description='Purple shiny brinjals, farm fresh.'),
            Product(farmer_id=demo_farmer.id, name='Chana Dal',         category='Pulses',
                    price=95.00,  stock=250, unit='kg',
                    description='Yellow split chickpeas.'),
            Product(farmer_id=demo_farmer.id, name='Fresh Coriander',   category='Vegetables',
                    price=20.00,  stock=100, unit='bunch',
                    description='Fragrant green coriander leaves.'),
            Product(farmer_id=demo_farmer.id, name='Lady Finger',       category='Vegetables',
                    price=50.00,  stock=100, unit='kg',
                    description='Fresh Bhindi (Lady Finger).'),
            Product(farmer_id=demo_farmer.id, name='Organic Oats',      category='Grains',
                    price=120.00, stock=80,  unit='kg',
                    description='Healthy whole grain oats.'),
            Product(farmer_id=demo_farmer.id, name='Juicy Oranges',     category='Fruits',
                    price=100.00, stock=120, unit='kg',
                    description='Sweet and tangy Nagpur oranges.'),
            Product(farmer_id=demo_farmer.id, name='Fresh Paneer',      category='Dairy',
                    price=320.00, stock=40,  unit='kg',
                    description='Soft and fresh malai paneer.'),
            Product(farmer_id=demo_farmer.id, name='Sweet Pineapple',   category='Fruits',
                    price=80.00,  stock=60,  unit='piece',
                    description='Tropical sweet pineapples.'),
            Product(farmer_id=demo_farmer.id, name='Fresh Potatoes',    category='Vegetables',
                    price=30.00,  stock=500, unit='kg',
                    description='Farm fresh potatoes, ideal for all dishes.'),
            Product(farmer_id=demo_farmer.id, name='Red Chilli Powder', category='Spices',
                    price=220.00, stock=70,  unit='kg',
                    description='Spicy ground red chillies.'),
            Product(farmer_id=demo_farmer.id, name='Soya Beans',        category='Pulses',
                    price=85.00,  stock=300, unit='kg',
                    description='High-protein soya beans.'),
            Product(farmer_id=demo_farmer.id, name='Toor Dal',          category='Pulses',
                    price=145.00, stock=180, unit='kg',
                    description='Premium quality split pigeon peas.'),
            Product(farmer_id=demo_farmer.id, name='Watermelon',        category='Fruits',
                    price=40.00,  stock=50,  unit='piece',
                    description='Sweet and hydrating watermelons.'),
        ]
        db.session.add_all(sample_products)
        db.session.commit()


def create_app():
    import os
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Frontend'))
    app = Flask(__name__, 
                static_folder=frontend_dir,
                static_url_path='')
    app.config.from_object(Config)
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

    # Extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # ── Register Blueprints ──────────────────────────
    from routes.auth_routes     import auth_bp
    from routes.product_routes  import product_bp
    from routes.order_routes    import order_bp
    from routes.tracking_routes import tracking_bp
    from routes.user_routes     import user_bp
    from routes.review_routes   import review_bp
    from routes.delivery_routes import delivery_bp
    from routes.weather_routes  import weather_bp
    from routes.admin_routes    import admin_bp
    from routes.notification_routes import notification_bp
    from routes.support_routes      import support_bp

    app.register_blueprint(auth_bp,     url_prefix='/api/auth')
    app.register_blueprint(product_bp,  url_prefix='/api/products')
    app.register_blueprint(order_bp,    url_prefix='/api/orders')
    app.register_blueprint(tracking_bp, url_prefix='/api/track')
    app.register_blueprint(user_bp,     url_prefix='/api/user')
    app.register_blueprint(review_bp,   url_prefix='/api/reviews')
    app.register_blueprint(delivery_bp, url_prefix='/api/delivery')
    app.register_blueprint(weather_bp,  url_prefix='/api/weather')
    app.register_blueprint(admin_bp,    url_prefix='/api/admin')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(support_bp,      url_prefix='/api/support')

    # Create all tables & seed demo data
    with app.app_context():
        print("Creating all tables...")
        db.create_all()
        print("Seeding demo data...")
        _seed_sample_products()
        print("Seeding complete.")

    # ── Serve Frontend ───────────────────────────────
    @app.route('/')
    def index():
        return app.send_static_file('html/index.html')

    @app.route('/<path:path>')
    def static_proxy(path):
        # Serve any static file from the Frontend directory
        return app.send_static_file(path)

    return app

# Expose app for 'flask run'
app = create_app()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
