from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from models.review_model import Review
from models.product_model import Product
from controllers.notification_controller import create_notification



def submit_review():
    """Customer submits a review for a product."""
    customer_id = int(get_jwt_identity())
    data = request.get_json()

    product_id = data.get('product_id')
    rating     = float(data.get('rating', 0))
    review_txt = data.get('review', '').strip()

    if not product_id:
        return jsonify({'error': 'product_id is required'}), 400
    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # Check for duplicate review
    existing = Review.query.filter_by(product_id=product_id, customer_id=customer_id).first()
    if existing:
        existing.rating = rating
        existing.review = review_txt
        db.session.commit()
        return jsonify({'message': 'Review updated', 'review': existing.to_dict()}), 200

    review = Review(
        product_id=product_id,
        customer_id=customer_id,
        rating=rating,
        review=review_txt
    )
    db.session.add(review)

    # Update product rating average
    all_reviews = Review.query.filter_by(product_id=product_id).all()
    total_ratings = sum(r.rating for r in all_reviews) + rating
    product.rating = round(total_ratings / (len(all_reviews) + 1), 2)

    # Notify Farmer
    create_notification(
        user_id=product.farmer_id,
        title="New Review Received! ⭐",
        message=f"A customer left a {rating}-star review for your product: {product.name}",
        n_type="info"
    )

    db.session.commit()
    return jsonify({'message': 'Review submitted', 'review': review.to_dict()}), 201


def get_product_reviews(product_id):
    """Get all reviews for a product."""
    reviews = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
    return jsonify({'reviews': [r.to_dict() for r in reviews]}), 200


def get_my_reviews():
    """Get all reviews written by the logged-in customer."""
    customer_id = int(get_jwt_identity())
    reviews = Review.query.filter_by(customer_id=customer_id).order_by(Review.created_at.desc()).all()
    return jsonify({'reviews': [r.to_dict() for r in reviews]}), 200


def get_farmer_reviews():
    """Get all reviews for products belonging to the logged-in farmer."""
    farmer_id = int(get_jwt_identity())
    # Join with Product to filter by farmer_id
    reviews = db.session.query(Review).join(Product).filter(Product.farmer_id == farmer_id).order_by(Review.created_at.desc()).all()
    
    # Calculate stats
    if not reviews:
        return jsonify({'reviews': [], 'avg_rating': 0, 'total': 0, 'distribution': {5:0,4:0,3:0,2:0,1:0}}), 200
        
    avg = round(sum(r.rating for r in reviews) / len(reviews), 1)
    dist = {5:0, 4:0, 3:0, 2:0, 1:0}
    for r in reviews:
        dist[int(r.rating)] = dist.get(int(r.rating), 0) + 1
        
    return jsonify({
        'reviews': [r.to_dict() for r in reviews],
        'avg_rating': avg,
        'total': len(reviews),
        'distribution': dist
    }), 200
