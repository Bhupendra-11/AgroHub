
import os
import sys

# Add current directory to sys.path
sys.path.append(os.getcwd())

try:
    from app import create_app, db
    from sqlalchemy import inspect
    
    app = create_app()
    with app.app_context():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Tables found: {tables}")
        
        from models.user_model import User
        user_count = User.query.count()
        print(f"User count: {user_count}")
        
        from models.product_model import Product
        product_count = Product.query.count()
        print(f"Product count: {product_count}")

except Exception as e:
    print(f"Error: {e}")
