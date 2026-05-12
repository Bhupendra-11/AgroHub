from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.user_controller import get_profile, update_profile, rate_user

user_bp = Blueprint('user', __name__)

user_bp.route('/profile', methods=['GET'])(jwt_required()(get_profile))
user_bp.route('/profile', methods=['PUT'])(jwt_required()(update_profile))
user_bp.route('/rate', methods=['POST'])(jwt_required()(rate_user))

