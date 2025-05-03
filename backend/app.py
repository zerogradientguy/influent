from flask import Flask, request, jsonify, session, send_from_directory, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
import json
import uuid
import random
from sqlalchemy import func, desc, and_, or_

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'influne_secret_key_dev')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///influne.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS

# File upload settings
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max upload
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'}

# Create uploads directory if it doesn't exist
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'brands'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'campaigns'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'content'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'portfolio'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'messages'), exist_ok=True)

# Enable CORS
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Initialize database
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'brand', 'influencer', or 'admin'
    profile_image = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    brand = db.relationship('Brand', backref='user', uselist=False, cascade="all, delete-orphan")
    influencer = db.relationship('Influencer', backref='user', uselist=False, cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade="all, delete-orphan")
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.recipient_id', backref='recipient', lazy=True)

class Brand(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    industry = db.Column(db.String(100))
    website = db.Column(db.String(200))
    description = db.Column(db.Text)
    logo_url = db.Column(db.String(200))
    location = db.Column(db.String(100))
    is_verified = db.Column(db.Boolean, default=False)
    
    # Relationships
    campaigns = db.relationship('Campaign', backref='brand', lazy=True, cascade="all, delete-orphan")

class Influencer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    niche = db.Column(db.String(100))
    bio = db.Column(db.Text)
    followers = db.Column(db.Integer, default=0)
    engagement_rate = db.Column(db.Float, default=0.0)
    location = db.Column(db.String(100))
    rating = db.Column(db.Float, default=0.0)
    social_media = db.Column(db.JSON)
    availability = db.Column(db.Boolean, default=True)
    pricing = db.Column(db.Float)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Relationships
    campaign_influencers = db.relationship('CampaignInfluencer', backref='influencer', lazy=True, cascade="all, delete-orphan")
    portfolio_items = db.relationship('PortfolioItem', backref='influencer', lazy=True, cascade="all, delete-orphan")

class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    brand_id = db.Column(db.Integer, db.ForeignKey('brand.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    budget = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    requirements = db.Column(db.Text)
    target_audience = db.Column(db.JSON)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'active', 'completed', 'cancelled'
    image_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    campaign_influencers = db.relationship('CampaignInfluencer', backref='campaign', lazy=True, cascade="all, delete-orphan")
    analytics = db.relationship('CampaignAnalytics', backref='campaign', uselist=False, cascade="all, delete-orphan")

class CampaignInfluencer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('influencer.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected', 'completed'
    compensation = db.Column(db.Float)
    rating = db.Column(db.Float)
    feedback = db.Column(db.Text)
    deliverables = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    content_items = db.relationship('ContentItem', backref='campaign_influencer', lazy=True, cascade="all, delete-orphan")

class ContentItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_influencer_id = db.Column(db.Integer, db.ForeignKey('campaign_influencer.id'), nullable=False)
    platform = db.Column(db.String(50))  # 'instagram', 'tiktok', etc.
    content_type = db.Column(db.String(50))  # 'post', 'story', 'video', etc.
    url = db.Column(db.String(200))
    description = db.Column(db.Text)
    engagement = db.Column(db.Integer, default=0)  # likes, views, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    files = db.relationship('ContentFile', backref='content_item', lazy=True, cascade="all, delete-orphan")

class ContentFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content_item_id = db.Column(db.Integer, db.ForeignKey('content_item.id'), nullable=False)
    path = db.Column(db.String(200), nullable=False)
    original_name = db.Column(db.String(200))
    mime_type = db.Column(db.String(100))
    size = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PortfolioItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    influencer_id = db.Column(db.Integer, db.ForeignKey('influencer.id'), nullable=False)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    platform = db.Column(db.String(50))
    url = db.Column(db.String(200))
    image_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CampaignAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    impressions = db.Column(db.Integer, default=0)
    reach = db.Column(db.Integer, default=0)
    engagement = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    roi = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50))  # 'info', 'success', 'warning', 'error'
    is_read = db.Column(db.Boolean, default=False)
    related_id = db.Column(db.Integer)  # ID of related entity (campaign, etc.)
    related_type = db.Column(db.String(50))  # Type of related entity ('campaign', etc.)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade="all, delete-orphan")
    
    # Define a unique constraint to prevent duplicate conversations
    __table_args__ = (
        db.UniqueConstraint('user1_id', 'user2_id', name='unique_conversation'),
    )

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    attachments = db.relationship('MessageAttachment', backref='message', lazy=True, cascade="all, delete-orphan")

class MessageAttachment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=False)
    path = db.Column(db.String(200), nullable=False)
    original_name = db.Column(db.String(200))
    mime_type = db.Column(db.String(100))
    size = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class VerificationRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    influencer_id = db.Column(db.Integer, db.ForeignKey('influencer.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    id_document_path = db.Column(db.String(200))
    social_media_links = db.Column(db.JSON)
    additional_info = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    influencer = db.relationship('Influencer', backref=db.backref('verification_requests', lazy=True))

# Helper Functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def save_file(file, folder):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Generate unique filename
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], folder, unique_filename)
        file.save(file_path)
        return os.path.join(folder, unique_filename)
    return None

def create_notification(user_id, title, message, type='info', related_id=None, related_type=None):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        related_id=related_id,
        related_type=related_type
    )
    db.session.add(notification)
    db.session.commit()
    return notification

def calculate_engagement_rate(influencer):
    """Calculate engagement rate based on social media data"""
    # This is a simplified calculation - in a real app, you'd use actual engagement metrics
    if not influencer.social_media:
        return 0.0
    
    try:
        social_data = influencer.social_media if isinstance(influencer.social_media, dict) else json.loads(influencer.social_media)
        total_followers = 0
        platforms = ['instagram', 'tiktok', 'youtube', 'twitter']
        
        for platform in platforms:
            if platform in social_data and social_data[platform]:
                # In a real app, you'd fetch actual follower counts from social APIs
                # For now, we'll use dummy values
                total_followers += 1000  # Dummy value
        
        # Simple engagement rate calculation (would be more complex in reality)
        if total_followers > 0:
            return round(random.uniform(1.0, 5.0), 2)  # Random value between 1% and 5%
        return 0.0
    except:
        return 0.0

def calculate_compensation(budget, influencer):
    """Calculate suggested compensation for an influencer based on metrics"""
    # Base rate in USD
    base_rate = 100
    
    # Factors based on followers and engagement
    follower_factor = influencer.followers / 10000 if influencer.followers else 0
    engagement_factor = influencer.engagement_rate * 10 if influencer.engagement_rate else 0
    
    # Calculate compensation
    compensation = base_rate + (follower_factor * engagement_factor)
    
    # Cap at 20% of campaign budget
    max_compensation = budget * 0.2
    
    return min(compensation, max_compensation)

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    # Create new user
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=data['role']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Create brand or influencer profile
    if data['role'] == 'brand':
        new_brand = Brand(user_id=new_user.id)
        db.session.add(new_brand)
    else:
        new_influencer = Influencer(
            user_id=new_user.id,
            social_media=json.dumps({
                'instagram': '',
                'tiktok': '',
                'youtube': '',
                'twitter': ''
            })
        )
        db.session.add(new_influencer)
    
    db.session.commit()
    
    # Set session
    session['user_id'] = new_user.id
    
    # Create welcome notification
    create_notification(
        new_user.id,
        "Welcome to Influne!",
        f"Thank you for joining Influne. Complete your profile to get started as a {data['role']}.",
        "success"
    )
    
    return jsonify({
        'message': 'Registration successful',
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Set session
    session['user_id'] = user.id
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'authenticated': False}), 401
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'authenticated': False}), 401
    
    return jsonify({
        'authenticated': True,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200

# File Routes
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Brand Routes
@app.route('/api/brand/profile', methods=['GET'])
def get_brand_profile():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    brand = Brand.query.filter_by(user_id=user_id).first()
    
    if not brand:
        return jsonify({'message': 'Brand profile not found'}), 404
    
    return jsonify({
        'brand': {
            'id': brand.id,
            'industry': brand.industry,
            'website': brand.website,
            'description': brand.description,
            'logo_url': brand.logo_url,
            'location': brand.location,
            'is_verified': brand.is_verified
        }
    }), 200

@app.route('/api/brand/profile', methods=['PUT'])
def update_brand_profile():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    brand = Brand.query.filter_by(user_id=user_id).first()
    
    if not brand:
        return jsonify({'message': 'Brand profile not found'}), 404
    
    data = request.json
    
    # Update user name
    if 'name' in data and data['name']:
        user.name = data['name']
    
    # Update brand details
    if 'industry' in data:
        brand.industry = data['industry']
    if 'website' in data:
        brand.website = data['website']
    if 'description' in data:
        brand.description = data['description']
    if 'location' in data:
        brand.location = data['location']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'brand': {
            'id': brand.id,
            'industry': brand.industry,
            'website': brand.website,
            'description': brand.description,
            'logo_url': brand.logo_url,
            'location': brand.location,
            'is_verified': brand.is_verified
        }
    }), 200

@app.route('/api/brand/logo', methods=['POST'])
def upload_brand_logo():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    brand = Brand.query.filter_by(user_id=user_id).first()
    
    if not brand:
        return jsonify({'message': 'Brand profile not found'}), 404
    
    if 'logo' not in request.files:
        return jsonify({'message': 'No file provided'}), 400
    
    file = request.files['logo']
    
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    file_path = save_file(file, 'brands')
    
    if not file_path:
        return jsonify({'message': 'Invalid file type'}), 400
    
    # Update brand logo URL
    brand.logo_url = file_path
    db.session.commit()
    
    return jsonify({
        'message': 'Logo uploaded successfully',
        'logo_url': file_path
    }), 200

@app.route('/api/brand/campaigns', methods=['GET'])
def get_brand_campaigns():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    brand = Brand.query.filter_by(user_id=user_id).first()
    
    if not brand:
        return jsonify({'message': 'Brand profile not found'}), 404
    
    campaigns = Campaign.query.filter_by(brand_id=brand.id).order_by(Campaign.created_at.desc()).all()
    
    campaigns_data = []
    for campaign in campaigns:
        influencer_count = CampaignInfluencer.query.filter_by(campaign_id=campaign.id, status='approved').count()
        
        campaigns_data.append({
            'id': campaign.id,
            'name': campaign.name,
            'status': campaign.status,
            'budget': campaign.budget,
            'startDate': campaign.start_date.isoformat(),
            'endDate': campaign.end_date.isoformat(),
            'influencerCount': influencer_count,
            'createdAt': campaign.created_at.isoformat()
        })
    
    return jsonify({'campaigns': campaigns_data}), 200

@app.route('/api/brand/stats', methods=['GET'])
def get_brand_stats():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    brand = Brand.query.filter_by(user_id=user_id).first()
    
    if not brand:
        return jsonify({'message': 'Brand profile not found'}), 404
    
    # Get active campaigns count
    active_campaigns = Campaign.query.filter_by(brand_id=brand.id, status='active').count()
    
    # Get total influencers count
    total_influencers = db.session.query(CampaignInfluencer).join(Campaign).filter(
        Campaign.brand_id == brand.id,
        CampaignInfluencer.status == 'approved'
    ).count()
    
    # Get pending requests count
    pending_requests = db.session.query(CampaignInfluencer).join(Campaign).filter(
        Campaign.brand_id == brand.id,
        CampaignInfluencer.status == 'pending'
    ).count()
    
    # Get completed campaigns count
    completed_campaigns = Campaign.query.filter_by(brand_id=brand.id, status='completed').count()
    
    return jsonify({
        'stats': {
            'activeCampaigns': active_campaigns,
            'totalInfluencers': total_influencers,
            'pendingRequests': pending_requests,
            'completedCampaigns': completed_campaigns
        }
    }), 200

@app.route('/api/brand/campaigns', methods=['POST'])
def create_campaign():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    brand = Brand.query.filter_by(user_id=user_id).first()
    
    if not brand:
        return jsonify({'message': 'Brand profile not found'}), 404
    
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'description', 'budget', 'startDate', 'endDate', 'requirements']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Create new campaign
    new_campaign = Campaign(
        brand_id=brand.id,
        name=data['name'],
        description=data['description'],
        budget=float(data['budget']),
        start_date=datetime.fromisoformat(data['startDate']),
        end_date=datetime.fromisoformat(data['endDate']),
        requirements=data['requirements'],
        target_audience=json.dumps(data.get('targetAudience', {})),
        status='active'
    )
    
    db.session.add(new_campaign)
    db.session.commit()
    
    # Create campaign analytics
    analytics = CampaignAnalytics(campaign_id=new_campaign.id)
    db.session.add(analytics)
    db.session.commit()
    
    # Find matching influencers and notify them
    matching_influencers = find_matching_influencers(new_campaign)
    
    for influencer in matching_influencers:
        create_notification(
            influencer.user_id,
            "New Campaign Match",
            f"A new campaign '{new_campaign.name}' matches your profile. Check it out!",
            "info",
            new_campaign.id,
            "campaign"
        )
    
    return jsonify({
        'message': 'Campaign created successfully',
        'campaign': {
            'id': new_campaign.id,
            'name': new_campaign.name,
            'status': new_campaign.status
        }
    }), 201

@app.route('/api/campaigns/<int:campaign_id>', methods=['PUT'])
def update_campaign(campaign_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    brand = Brand.query.get(campaign.brand_id)
    
    if brand.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    data = request.json
    
    # Update campaign details
    if 'name' in data:
        campaign.name = data['name']
    if 'description' in data:
        campaign.description = data['description']
    if 'budget' in data:
        campaign.budget = float(data['budget'])
    if 'startDate' in data:
        campaign.start_date = datetime.fromisoformat(data['startDate'])
    if 'endDate' in data:
        campaign.end_date = datetime.fromisoformat(data['endDate'])
    if 'requirements' in data:
        campaign.requirements = data['requirements']
    if 'status' in data:
        campaign.status = data['status']
    if 'targetAudience' in data:
        campaign.target_audience = json.dumps(data['targetAudience'])
    
    campaign.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Campaign updated successfully',
        'campaign': {
            'id': campaign.id,
            'name': campaign.name,
            'status': campaign.status
        }
    }), 200

# Influencer Routes
@app.route('/api/influencer/profile', methods=['GET'])
def get_influencer_profile():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    # Parse social media JSON if it's a string
    social_media = influencer.social_media
    if isinstance(social_media, str):
        try:
            social_media = json.loads(social_media)
        except:
            social_media = {
                'instagram': '',
                'tiktok': '',
                'youtube': '',
                'twitter': ''
            }
    
    return jsonify({
        'influencer': {
            'id': influencer.id,
            'niche': influencer.niche,
            'bio': influencer.bio,
            'followers': influencer.followers,
            'engagement_rate': influencer.engagement_rate,
            'location': influencer.location,
            'rating': influencer.rating,
            'social_media': social_media,
            'availability': influencer.availability,
            'pricing': influencer.pricing,
            'isVerified': influencer.is_verified
        }
    }), 200

@app.route('/api/influencer/profile', methods=['PUT'])
def update_influencer_profile():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    data = request.json
    
    # Update user name
    if 'name' in data and data['name']:
        user.name = data['name']
    
    # Update influencer details
    if 'niche' in data:
        influencer.niche = data['niche']
    if 'bio' in data:
        influencer.bio = data['bio']
    if 'location' in data:
        influencer.location = data['location']
    if 'pricing' in data:
        influencer.pricing = float(data['pricing']) if data['pricing'] else None
    if 'availability' in data:
        influencer.availability = data['availability']
    
    # Update social media
    if 'socialMedia' in data:
        influencer.social_media = json.dumps(data['socialMedia'])
    
    # Update followers count
    if 'followers' in data:
        # Calculate total followers from all platforms
        total_followers = 0
        for platform, count in data['followers'].items():
            if count:
                total_followers += int(count)
        
        influencer.followers = total_followers
        
        # Recalculate engagement rate
        influencer.engagement_rate = calculate_engagement_rate(influencer)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'influencer': {
            'id': influencer.id,
            'niche': influencer.niche,
            'bio': influencer.bio,
            'followers': influencer.followers,
            'engagement_rate': influencer.engagement_rate,
            'location': influencer.location,
            'rating': influencer.rating,
            'social_media': data.get('socialMedia', {}),
            'availability': influencer.availability,
            'pricing': influencer.pricing,
            'isVerified': influencer.is_verified
        }
    }), 200

@app.route('/api/influencer/campaigns', methods=['GET'])
def get_influencer_campaigns():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    # Get campaigns the influencer is part of
    campaign_influencers = CampaignInfluencer.query.filter_by(influencer_id=influencer.id).all()
    
    campaigns_data = []
    for ci in campaign_influencers:
        campaign = Campaign.query.get(ci.campaign_id)
        brand = Brand.query.get(campaign.brand_id)
        brand_user = User.query.get(brand.user_id)
        
        campaigns_data.append({
            'id': campaign.id,
            'name': campaign.name,
            'brandName': brand_user.name,
            'status': ci.status,
            'compensation': ci.compensation,
            'deadline': campaign.end_date.isoformat(),
            'description': campaign.description
        })
    
    return jsonify({'campaigns': campaigns_data}), 200

@app.route('/api/influencer/available-campaigns', methods=['GET'])
def get_available_campaigns():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    # Get active campaigns that the influencer hasn't applied to yet
    subquery = db.session.query(CampaignInfluencer.campaign_id).filter_by(influencer_id=influencer.id)
    campaigns = Campaign.query.filter(
        Campaign.status == 'active',
        Campaign.end_date > datetime.utcnow(),
        ~Campaign.id.in_(subquery)
    ).all()
    
    campaigns_data = []
    for campaign in campaigns:
        brand = Brand.query.get(campaign.brand_id)
        brand_user = User.query.get(brand.user_id)
        
        # Parse target audience
        target_audience = campaign.target_audience
        if isinstance(target_audience, str):
            try:
                target_audience = json.loads(target_audience)
            except:
                target_audience = {}
        
        campaigns_data.append({
            'id': campaign.id,
            'name': campaign.name,
            'brandName': brand_user.name,
            'description': campaign.description,
            'budget': campaign.budget,
            'startDate': campaign.start_date.isoformat(),
            'endDate': campaign.end_date.isoformat(),
            'status': campaign.status,
            'targetAudience': target_audience
        })
    
    return jsonify({'campaigns': campaigns_data}), 200

@app.route('/api/influencer/stats', methods=['GET'])
def get_influencer_stats():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    # Get active campaigns count
    active_campaigns = db.session.query(CampaignInfluencer).join(Campaign).filter(
        CampaignInfluencer.influencer_id == influencer.id,
        CampaignInfluencer.status == 'approved',
        Campaign.status == 'active'
    ).count()
    
    # Get total earnings
    total_earnings = db.session.query(db.func.sum(CampaignInfluencer.compensation)).filter(
        CampaignInfluencer.influencer_id == influencer.id,
        CampaignInfluencer.status == 'completed'
    ).scalar() or 0
    
    # Get pending requests count
    pending_requests = CampaignInfluencer.query.filter_by(
        influencer_id=influencer.id,
        status='pending'
    ).count()
    
    # Get average rating
    average_rating = influencer.rating or 0
    
    return jsonify({
        'stats': {
            'activeCampaigns': active_campaigns,
            'totalEarnings': total_earnings,
            'pendingRequests': pending_requests,
            'averageRating': average_rating
        }
    }), 200

@app.route('/api/influencer/portfolio', methods=['GET'])
def get_portfolio():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    portfolio_items = PortfolioItem.query.filter_by(influencer_id=influencer.id).order_by(PortfolioItem.created_at.desc()).all()
    
    items_data = []
    for item in portfolio_items:
        items_data.append({
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'platform': item.platform,
            'url': item.url,
            'image_url': item.image_url,
            'created_at': item.created_at.isoformat()
        })
    
    return jsonify({'portfolioItems': items_data}), 200

@app.route('/api/influencer/portfolio', methods=['POST'])
def add_portfolio_item():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    # Get form data
    title = request.form.get('title')
    description = request.form.get('description')
    platform = request.form.get('platform')
    url = request.form.get('url')
    
    if not title or not platform or not url:
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Handle image upload
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            image_url = save_file(file, 'portfolio')
    
    # Create new portfolio item
    new_item = PortfolioItem(
        influencer_id=influencer.id,
        title=title,
        description=description,
        platform=platform,
        url=url,
        image_url=image_url
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Portfolio item added successfully',
        'portfolioItem': {
            'id': new_item.id,
            'title': new_item.title,
            'description': new_item.description,
            'platform': new_item.platform,
            'url': new_item.url,
            'image_url': new_item.image_url,
            'created_at': new_item.created_at.isoformat()
        }
    }), 201

@app.route('/api/influencer/portfolio/<int:item_id>', methods=['PUT'])
def update_portfolio_item(item_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    portfolio_item = PortfolioItem.query.get(item_id)
    
    if not portfolio_item or portfolio_item.influencer_id != influencer.id:
        return jsonify({'message': 'Portfolio item not found'}), 404
    
    # Get form data
    title = request.form.get('title')
    description = request.form.get('description')
    platform = request.form.get('platform')
    url = request.form.get('url')
    
    if not title or not platform or not url:
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Update portfolio item
    portfolio_item.title = title
    portfolio_item.description = description
    portfolio_item.platform = platform
    portfolio_item.url = url
    
    # Handle image upload
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            image_url = save_file(file, 'portfolio')
            portfolio_item.image_url = image_url
    
    db.session.commit()
    
    return jsonify({
        'message': 'Portfolio item updated successfully',
        'portfolioItem': {
            'id': portfolio_item.id,
            'title': portfolio_item.title,
            'description': portfolio_item.description,
            'platform': portfolio_item.platform,
            'url': portfolio_item.url,
            'image_url': portfolio_item.image_url,
            'created_at': portfolio_item.created_at.isoformat()
        }
    }), 200

@app.route('/api/influencer/portfolio/<int:item_id>', methods=['DELETE'])
def delete_portfolio_item(item_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    portfolio_item = PortfolioItem.query.get(item_id)
    
    if not portfolio_item or portfolio_item.influencer_id != influencer.id:
        return jsonify({'message': 'Portfolio item not found'}), 404
    
    db.session.delete(portfolio_item)
    db.session.commit()
    
    return jsonify({'message': 'Portfolio item deleted successfully'}), 200

# Campaign Routes
@app.route('/api/campaigns/<int:campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    brand = Brand.query.get(campaign.brand_id)
    brand_user = User.query.get(brand.user_id)
    
    # Parse target audience JSON if it's a string
    target_audience = campaign.target_audience
    if isinstance(target_audience, str):
        try:
            target_audience = json.loads(target_audience)
        except:
            target_audience = {}
    
    campaign_data = {
        'id': campaign.id,
        'name': campaign.name,
        'brandName': brand_user.name,
        'description': campaign.description,
        'budget': campaign.budget,
        'startDate': campaign.start_date.isoformat(),
        'endDate': campaign.end_date.isoformat(),
        'requirements': campaign.requirements,
        'targetAudience': target_audience,
        'status': campaign.status,
        'image_url': campaign.image_url,
        'createdAt': campaign.created_at.isoformat()
    }
    
    # If user is an influencer, check if they've applied to this campaign
    if User.query.get(user_id).role == 'influencer':
        influencer = Influencer.query.filter_by(user_id=user_id).first()
        campaign_influencer = CampaignInfluencer.query.filter_by(
            campaign_id=campaign_id,
            influencer_id=influencer.id
        ).first()
        
        if campaign_influencer:
            campaign_data['campaignInfluencer'] = {
                'id': campaign_influencer.id,
                'status': campaign_influencer.status,
                'compensation': campaign_influencer.compensation
            }
    
    return jsonify({'campaign': campaign_data}), 200

@app.route('/api/campaigns/<int:campaign_id>/influencers', methods=['GET'])
def get_campaign_influencers(campaign_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    campaign_influencers = CampaignInfluencer.query.filter_by(campaign_id=campaign_id).all()
    
    influencers_data = []
    for ci in campaign_influencers:
        influencer = Influencer.query.get(ci.influencer_id)
        user = User.query.get(influencer.user_id)
        
        influencers_data.append({
            'id': ci.id,
            'influencerId': influencer.id,
            'name': user.name,
            'niche': influencer.niche or 'General',
            'followers': influencer.followers or 0,
            'engagementRate': influencer.engagement_rate or 0,
            'status': ci.status
        })
    
    return jsonify({'influencers': influencers_data}), 200

@app.route('/api/campaigns/<int:campaign_id>/apply', methods=['POST'])
def apply_to_campaign(campaign_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    # Check if already applied
    existing_application = CampaignInfluencer.query.filter_by(
        campaign_id=campaign_id,
        influencer_id=influencer.id
    ).first()
    
    if existing_application:
        return jsonify({'message': 'Already applied to this campaign'}), 400
    
    # Create new application
    new_application = CampaignInfluencer(
        campaign_id=campaign_id,
        influencer_id=influencer.id,
        status='pending',
        compensation=0  # Will be set by brand if approved
    )
    
    db.session.add(new_application)
    db.session.commit()
    
    # Notify brand about the application
    brand = Brand.query.get(campaign.brand_id)
    create_notification(
        brand.user_id,
        "New Campaign Application",
        f"{user.name} has applied to your campaign '{campaign.name}'.",
        "info",
        campaign.id,
        "campaign"
    )
    
    return jsonify({'message': 'Successfully applied to campaign'}), 201

@app.route('/api/campaigns/<int:campaign_id>/influencers/<int:influencer_id>/<action>', methods=['POST'])
def handle_influencer_action(campaign_id, influencer_id, action):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    brand = Brand.query.get(campaign.brand_id)
    
    if brand.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign_influencer = CampaignInfluencer.query.filter_by(
        campaign_id=campaign_id,
        influencer_id=influencer_id
    ).first()
    
    if not campaign_influencer:
        return jsonify({'message': 'Influencer application not found'}), 404
    
    influencer = Influencer.query.get(influencer_id)
    influencer_user = User.query.get(influencer.user_id)
    
    if action == 'approve':
        campaign_influencer.status = 'approved'
        # Set compensation based on campaign budget and influencer metrics
        campaign_influencer.compensation = calculate_compensation(campaign.budget, influencer)
        
        # Notify influencer about approval
        create_notification(
            influencer.user_id,
            "Campaign Application Approved",
            f"Your application for the campaign '{campaign.name}' has been approved!",
            "success",
            campaign.id,
            "campaign"
        )
    
    elif action == 'reject':
        campaign_influencer.status = 'rejected'
        
        # Notify influencer about rejection
        create_notification(
            influencer.user_id,
            "Campaign Application Rejected",
            f"Your application for the campaign '{campaign.name}' was not approved.",
            "warning",
            campaign.id,
            "campaign"
        )
    
    else:
        return jsonify({'message': 'Invalid action'}), 400
    
    db.session.commit()
    
    return jsonify({'message': f'Influencer {action}d successfully'}), 200

@app.route('/api/campaigns/<int:campaign_id>/content', methods=['GET'])
def get_campaign_content(campaign_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    # Check if user has access to this campaign
    if user.role == 'brand':
        brand = Brand.query.filter_by(user_id=user_id).first()
        if campaign.brand_id != brand.id:
            return jsonify({'message': 'Unauthorized'}), 401
        
        # Get all content for this campaign
        campaign_influencers = CampaignInfluencer.query.filter_by(campaign_id=campaign_id).all()
        content_items = []
        
        for ci in campaign_influencers:
            items = ContentItem.query.filter_by(campaign_influencer_id=ci.id).all()
            for item in items:
                influencer = Influencer.query.get(ci.influencer_id)
                influencer_user = User.query.get(influencer.user_id)
                
                files_data = []
                for file in item.files:
                    files_data.append({
                        'path': file.path,
                        'originalName': file.original_name,
                        'mimeType': file.mime_type,
                        'size': file.size
                    })
                
                content_items.append({
                    'id': item.id,
                    'influencerName': influencer_user.name,
                    'influencerId': influencer.id,
                    'platform': item.platform,
                    'contentType': item.content_type,
                    'url': item.url,
                    'description': item.description,
                    'engagement': item.engagement,
                    'createdAt': item.created_at.isoformat(),
                    'files': files_data
                })
    
    elif user.role == 'influencer':
        influencer = Influencer.query.filter_by(user_id=user_id).first()
        campaign_influencer = CampaignInfluencer.query.filter_by(
            campaign_id=campaign_id,
            influencer_id=influencer.id
        ).first()
        
        if not campaign_influencer:
            return jsonify({'message': 'Unauthorized'}), 401
        
        # Get content submitted by this influencer for this campaign
        items = ContentItem.query.filter_by(campaign_influencer_id=campaign_influencer.id).all()
        content_items = []
        
        for item in items:
            files_data = []
            for file in item.files:
                files_data.append({
                    'path': file.path,
                    'originalName': file.original_name,
                    'mimeType': file.mime_type,
                    'size': file.size
                })
            
            content_items.append({
                'id': item.id,
                'platform': item.platform,
                'contentType': item.content_type,
                'url': item.url,
                'description': item.description,
                'engagement': item.engagement,
                'createdAt': item.created_at.isoformat(),
                'files': files_data
            })
    
    else:
        return jsonify({'message': 'Unauthorized'}), 401
    
    return jsonify({'contentItems': content_items}), 200

@app.route('/api/campaigns/<int:campaign_id>/content', methods=['POST'])
def submit_campaign_content(campaign_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    campaign_influencer = CampaignInfluencer.query.filter_by(
        campaign_id=campaign_id,
        influencer_id=influencer.id,
        status='approved'
    ).first()
    
    if not campaign_influencer:
        return jsonify({'message': 'You are not approved for this campaign'}), 403
    
    # Get form data
    platform = request.form.get('platform')
    content_type = request.form.get('contentType')
    url = request.form.get('url')
    description = request.form.get('description')
    
    if not platform or not content_type or (not url and 'files' not in request.files):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create new content item
    new_content = ContentItem(
        campaign_influencer_id=campaign_influencer.id,
        platform=platform,
        content_type=content_type,
        url=url,
        description=description,
        engagement=0  # Will be updated later
    )
    
    db.session.add(new_content)
    db.session.commit()
    
    # Handle file uploads
    files_data = []
    if 'files' in request.files:
        files = request.files.getlist('files')
        for file in files:
            if file.filename != '':
                file_path = save_file(file, 'content')
                if file_path:
                    new_file = ContentFile(
                        content_item_id=new_content.id,
                        path=file_path,
                        original_name=file.filename,
                        mime_type=file.content_type,
                        size=len(file.read())
                    )
                    file.seek(0)  # Reset file pointer after reading
                    db.session.add(new_file)
                    
                    files_data.append({
                        'path': file_path,
                        'originalName': file.filename,
                        'mimeType': file.content_type,
                        'size': len(file.read())
                    })
    
    db.session.commit()
    
    # Notify brand about new content
    campaign = Campaign.query.get(campaign_id)
    brand = Brand.query.get(campaign.brand_id)
    create_notification(
        brand.user_id,
        "New Content Submission",
        f"{user.name} has submitted content for your campaign '{campaign.name}'.",
        "info",
        campaign.id,
        "campaign"
    )
    
    return jsonify({
        'message': 'Content submitted successfully',
        'contentItem': {
            'id': new_content.id,
            'platform': new_content.platform,
            'contentType': new_content.content_type,
            'url': new_content.url,
            'description': new_content.description,
            'createdAt': new_content.created_at.isoformat(),
            'files': files_data
        }
    }), 201

@app.route('/api/campaigns/<int:campaign_id>/analytics', methods=['GET'])
def get_campaign_analytics(campaign_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    brand = Brand.query.get(campaign.brand_id)
    
    if brand.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    analytics = CampaignAnalytics.query.filter_by(campaign_id=campaign_id).first()
    
    if not analytics:
        # Create analytics if not exists
        analytics = CampaignAnalytics(campaign_id=campaign_id)
        db.session.add(analytics)
        db.session.commit()
    
    # Get content performance by platform
    content_performance = []
    platforms = db.session.query(ContentItem.platform, func.count(ContentItem.id).label('count'), 
                               func.sum(ContentItem.engagement).label('total_engagement'))\
        .join(CampaignInfluencer)\
        .filter(CampaignInfluencer.campaign_id == campaign_id)\
        .group_by(ContentItem.platform)\
        .all()
    
    for platform, count, engagement in platforms:
        # Generate some random data for demo purposes
        content_performance.append({
            'platform': platform,
            'engagement': engagement or random.randint(500, 2000),
            'clicks': random.randint(100, 500),
            'conversions': random.randint(5, 50)
        })
    
    # Get influencer performance
    influencer_performance = []
    campaign_influencers = CampaignInfluencer.query.filter_by(campaign_id=campaign_id, status='approved').all()
    
    for ci in campaign_influencers:
        influencer = Influencer.query.get(ci.influencer_id)
        user = User.query.get(influencer.user_id)
        
        # Calculate total engagement for this influencer
        total_engagement = db.session.query(func.sum(ContentItem.engagement))\
            .filter(ContentItem.campaign_influencer_id == ci.id)\
            .scalar() or 0
        
        # Generate some random data for demo purposes
        influencer_performance.append({
            'name': user.name,
            'engagement': total_engagement or random.randint(500, 1500),
            'clicks': random.randint(100, 400),
            'conversions': random.randint(5, 30),
            'roi': round(random.uniform(1.5, 4.0), 1)
        })
    
    # Generate daily stats for the campaign duration
    daily_stats = []
    
    # Calculate number of days between start and end date
    start_date = campaign.start_date
    end_date = min(campaign.end_date, datetime.utcnow())
    days_diff = (end_date - start_date).days + 1
    
    # Generate stats for each day
    for i in range(days_diff):
        current_date = start_date + timedelta(days=i)
        daily_stats.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'impressions': random.randint(500, 2000),
            'engagement': random.randint(100, 500),
            'clicks': random.randint(30, 150),
            'conversions': random.randint(1, 10)
        })
    
    return jsonify({
        'analytics': {
            'impressions': analytics.impressions,
            'reach': analytics.reach,
            'engagement': analytics.engagement,
            'clicks': analytics.clicks,
            'conversions': analytics.conversions,
            'roi': analytics.roi
        },
        'contentPerformance': content_performance,
        'influencerPerformance': influencer_performance,
        'dailyStats': daily_stats
    }), 200

# Influencer Search Routes
@app.route('/api/influencers', methods=['GET'])
def get_influencers():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get query parameters for filtering
    niche = request.args.get('niche')
    min_followers = request.args.get('min_followers')
    max_followers = request.args.get('max_followers')
    min_engagement = request.args.get('min_engagement')
    location = request.args.get('location')
    
    # Build query
    query = Influencer.query.join(User).filter(User.is_active == True)
    
    if niche:
        query = query.filter(Influencer.niche == niche)
    
    if min_followers:
        query = query.filter(Influencer.followers >= int(min_followers))
    
    if max_followers:
        query = query.filter(Influencer.followers <= int(max_followers))
    
    if min_engagement:
        query = query.filter(Influencer.engagement_rate >= float(min_engagement))
    
    if location:
        query = query.filter(Influencer.location.ilike(f'%{location}%'))
    
    influencers = query.all()
    
    influencers_data = []
    for influencer in influencers:
        user = User.query.get(influencer.user_id)
        
        influencers_data.append({
            'id': influencer.id,
            'name': user.name,
            'niche': influencer.niche or 'General',
            'bio': influencer.bio or 'No bio available',
            'followers': influencer.followers or 0,
            'engagementRate': influencer.engagement_rate or 0,
            'location': influencer.location or 'Not specified',
            'rating': influencer.rating or 0,
            'profile_image': user.profile_image,
            'isVerified': influencer.is_verified
        })
    
    return jsonify({'influencers': influencers_data}), 200

@app.route('/api/influencers/<int:influencer_id>', methods=['GET'])
def get_influencer(influencer_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.get(influencer_id)
    
    if not influencer:
        return jsonify({'message': 'Influencer not found'}), 404
    
    user = User.query.get(influencer.user_id)

    # Get the latest verification request for additional status info
    latest_request = VerificationRequest.query.filter_by(
        influencer_id=influencer.id
    ).order_by(VerificationRequest.created_at.desc()).first()
    
    verification_status = None
    if latest_request:
        verification_status = latest_request.status
    
    influencer_data = {
        'id': influencer.id,
        'userId': user.id,
        'name': user.name,
        'niche': influencer.niche,
        'bio': influencer.bio,
        'followers': influencer.followers,
        'engagementRate': influencer.engagement_rate,
        'location': influencer.location,
        'rating': influencer.rating,
        'socialMedia': influencer.social_media,
        'availability': influencer.availability,
        'pricing': influencer.pricing,
        'profileImage': user.profile_image,
        'isVerified': influencer.is_verified,
        'verificationStatus': verification_status
    }
    
    return jsonify({'influencer': influencer_data}), 200

@app.route('/api/influencers/<int:influencer_id>/portfolio', methods=['GET'])
def get_influencer_portfolio(influencer_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.get(influencer_id)
    
    if not influencer:
        return jsonify({'message': 'Influencer not found'}), 404
    
    portfolio_items = PortfolioItem.query.filter_by(influencer_id=influencer_id).all()
    
    items_data = []
    for item in portfolio_items:
        items_data.append({
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'platform': item.platform,
            'url': item.url,
            'image_url': item.image_url,
            'created_at': item.created_at.isoformat()
        })
    
    return jsonify({'portfolioItems': items_data}), 200

# Notification Routes
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    
    notifications_data = []
    for notification in notifications:
        notifications_data.append({
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'type': notification.type,
            'is_read': notification.is_read,
            'related_id': notification.related_id,
            'related_type': notification.related_type,
            'created_at': notification.created_at.isoformat()
        })
    
    return jsonify({'notifications': notifications_data}), 200

@app.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    notification = Notification.query.get(notification_id)
    
    if not notification or notification.user_id != user_id:
        return jsonify({'message': 'Notification not found'}), 404
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Notification marked as read'}), 200

@app.route('/api/notifications/read-all', methods=['POST'])
def mark_all_notifications_read():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    
    return jsonify({'message': 'All notifications marked as read'}), 200

@app.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    notification = Notification.query.get(notification_id)
    
    if not notification or notification.user_id != user_id:
        return jsonify({'message': 'Notification not found'}), 404
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': 'Notification deleted'}), 200

@app.route('/api/notifications/delete-all', methods=['DELETE'])
def delete_all_notifications():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'All notifications deleted'}), 200

# Messaging Routes
@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Find all conversations where the user is a participant
    conversations = Conversation.query.filter(
        or_(Conversation.user1_id == user_id, Conversation.user2_id == user_id)
    ).order_by(Conversation.updated_at.desc()).all()
    
    conversations_data = []
    for conversation in conversations:
        # Determine the other user in the conversation
        other_user_id = conversation.user2_id if conversation.user1_id == user_id else conversation.user1_id
        other_user = User.query.get(other_user_id)
        
        # Get the last message in the conversation
        last_message = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp.desc()).first()
        
        # Count unread messages
        unread_count = Message.query.filter_by(
            conversation_id=conversation.id,
            recipient_id=user_id,
            is_read=False
        ).count()
        
        conversations_data.append({
            'id': conversation.id,
            'otherUser': {
                'id': other_user.id,
                'name': other_user.name,
                'role': other_user.role,
                'profileImage': other_user.profile_image
            },
            'lastMessage': {
                'content': last_message.content if last_message else None,
                'timestamp': last_message.timestamp.isoformat() if last_message else None,
                'isRead': last_message.is_read if last_message else True
            },
            'unreadCount': unread_count,
            'createdAt': conversation.created_at.isoformat(),
            'updatedAt': conversation.updated_at.isoformat()
        })
    
    return jsonify({'conversations': conversations_data}), 200

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    data = request.json
    recipient_id = data.get('recipientId')
    
    if not recipient_id:
        return jsonify({'message': 'Recipient ID is required'}), 400
    
    # Check if recipient exists
    recipient = User.query.get(recipient_id)
    
    if not recipient:
        return jsonify({'message': 'Recipient not found'}), 404
    
    # Check if conversation already exists
    existing_conversation = Conversation.query.filter(
        or_(
            and_(Conversation.user1_id == user_id, Conversation.user2_id == recipient_id),
            and_(Conversation.user1_id == recipient_id, Conversation.user2_id == user_id)
        )
    ).first()
    
    if existing_conversation:
        return jsonify({'conversationId': existing_conversation.id}), 200
    
    # Create new conversation
    new_conversation = Conversation(
        user1_id=user_id,
        user2_id=recipient_id
    )
    
    db.session.add(new_conversation)
    db.session.commit()
    
    return jsonify({'conversationId': new_conversation.id}), 201

@app.route('/api/conversations/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation:
        return jsonify({'message': 'Conversation not found'}), 404
    
    # Check if user is a participant in the conversation
    if conversation.user1_id != user_id and conversation.user2_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Determine the other user in the conversation
    other_user_id = conversation.user2_id if conversation.user1_id == user_id else conversation.user1_id
    other_user = User.query.get(other_user_id)
    
    # Get messages in the conversation
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.timestamp).all()
    
    # Mark messages as read
    for message in messages:
        if message.recipient_id == user_id and not message.is_read:
            message.is_read = True
    
    db.session.commit()
    
    messages_data = []
    for message in messages:
        attachments_data = []
        for attachment in message.attachments:
            attachments_data.append({
                'path': attachment.path,
                'originalName': attachment.original_name,
                'mimeType': attachment.mime_type,
                'size': attachment.size
            })
        
        messages_data.append({
            'id': message.id,
            'senderId': message.sender_id,
            'recipientId': message.recipient_id,
            'content': message.content,
            'isRead': message.is_read,
            'timestamp': message.timestamp.isoformat(),
            'attachments': attachments_data
        })
    
    return jsonify({
        'conversation': {
            'id': conversation.id,
            'otherUser': {
                'id': other_user.id,
                'name': other_user.name,
                'role': other_user.role,
                'profileImage': other_user.profile_image
            },
            'createdAt': conversation.created_at.isoformat(),
            'updatedAt': conversation.updated_at.isoformat()
        },
        'messages': messages_data
    }), 200

@app.route('/api/conversations/<int:conversation_id>/messages', methods=['GET'])
def get_new_messages(conversation_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation:
        return jsonify({'message': 'Conversation not found'}), 404
    
    # Check if user is a participant in the conversation
    if conversation.user1_id != user_id and conversation.user2_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get messages after a certain ID
    after_id = request.args.get('after')
    
    if after_id:
        messages = Message.query.filter(
            Message.conversation_id == conversation_id,
            Message.id > int(after_id)
        ).order_by(Message.timestamp).all()
    else:
        messages = []
    
    # Mark messages as read
    for message in messages:
        if message.recipient_id == user_id and not message.is_read:
            message.is_read = True
    
    db.session.commit()
    
    messages_data = []
    for message in messages:
        attachments_data = []
        for attachment in message.attachments:
            attachments_data.append({
                'path': attachment.path,
                'originalName': attachment.original_name,
                'mimeType': attachment.mime_type,
                'size': attachment.size
            })
        
        messages_data.append({
            'id': message.id,
            'senderId': message.sender_id,
            'recipientId': message.recipient_id,
            'content': message.content,
            'isRead': message.is_read,
            'timestamp': message.timestamp.isoformat(),
            'attachments': attachments_data
        })
    
    return jsonify({'messages': messages_data}), 200

@app.route('/api/conversations/<int:conversation_id>/messages', methods=['POST'])
def send_message(conversation_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    conversation = Conversation.query.get(conversation_id)
    
    if not conversation:
        return jsonify({'message': 'Conversation not found'}), 404
    
    # Check if user is a participant in the conversation
    if conversation.user1_id != user_id and conversation.user2_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Determine the recipient
    recipient_id = conversation.user2_id if conversation.user1_id == user_id else conversation.user1_id
    
    # Get message content
    content = request.form.get('content', '')
    
    if not content and 'attachments' not in request.files:
        return jsonify({'message': 'Message content or attachments required'}), 400
    
    # Create new message
    new_message = Message(
        conversation_id=conversation_id,
        sender_id=user_id,
        recipient_id=recipient_id,
        content=content
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    # Handle attachments
    attachments_data = []
    if 'attachments' in request.files:
        files = request.files.getlist('attachments')
        for file in files:
            if file.filename != '':
                file_path = save_file(file, 'messages')
                if file_path:
                    new_attachment = MessageAttachment(
                        message_id=new_message.id,
                        path=file_path,
                        original_name=file.filename,
                        mime_type=file.content_type,
                        size=len(file.read())
                    )
                    file.seek(0)  # Reset file pointer after reading
                    db.session.add(new_attachment)
                    
                    attachments_data.append({
                        'path': file_path,
                        'originalName': file.filename,
                        'mimeType': file.content_type,
                        'size': len(file.read())
                    })
    
    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    db.session.commit()
    
    # Create notification for recipient
    sender = User.query.get(user_id)
    create_notification(
        recipient_id,
        "New Message",
        f"You have a new message from {sender.name}",
        "info",
        conversation.id,
        "message"
    )
    
    return jsonify({
        'message': {
            'id': new_message.id,
            'senderId': new_message.sender_id,
            'recipientId': new_message.recipient_id,
            'content': new_message.content,
            'isRead': new_message.is_read,
            'timestamp': new_message.timestamp.isoformat(),
            'attachments': attachments_data
        }
    }), 201

# Helper function to find matching influencers for a campaign
def find_matching_influencers(campaign):
    """Find influencers that match the campaign requirements"""
    # Parse target audience
    target_audience = campaign.target_audience
    if isinstance(target_audience, str):
        try:
            target_audience = json.loads(target_audience)
        except:
            target_audience = {}
    
    # Build query
    query = Influencer.query.join(User).filter(User.is_active == True, Influencer.availability == True)
    
    # Filter by niche if specified
    if target_audience.get('interests'):
        query = query.filter(Influencer.niche.in_(target_audience['interests']))
    
    # Get matching influencers
    return query.all()

@app.route('/api/campaigns/<int:campaign_id>/influencers/<int:influencer_id>/feedback', methods=['POST'])
def submit_influencer_feedback(campaign_id, influencer_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'brand':
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign = Campaign.query.get(campaign_id)
    
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    brand = Brand.query.get(campaign.brand_id)
    
    if brand.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    campaign_influencer = CampaignInfluencer.query.filter_by(
        campaign_id=campaign_id,
        influencer_id=influencer_id
    ).first()
    
    if not campaign_influencer:
        return jsonify({'message': 'Influencer not found in this campaign'}), 404
    
    data = request.json
    rating = data.get('rating')
    feedback = data.get('feedback')
    
    if not rating or rating < 1 or rating > 5:
        return jsonify({'message': 'Invalid rating'}), 400
    
    # Update campaign influencer rating and feedback
    campaign_influencer.rating = rating
    campaign_influencer.feedback = feedback
    
    # Update influencer's overall rating (average of all ratings)
    influencer = Influencer.query.get(influencer_id)
    
    # Get all ratings for this influencer
    all_ratings = db.session.query(CampaignInfluencer.rating).filter(
        CampaignInfluencer.influencer_id == influencer_id,
        CampaignInfluencer.rating.isnot(None)
    ).all()
    
    # Calculate new average rating
    ratings = [r[0] for r in all_ratings if r[0] is not None]
    if ratings:
        influencer.rating = sum(ratings) / len(ratings)
    
    db.session.commit()
    
    # Notify influencer about the feedback
    create_notification(
        influencer.user_id,
        "New Campaign Feedback",
        f"You've received feedback for your work on the campaign '{campaign.name}'.",
        "info",
        campaign.id,
        "campaign"
    )
    
    return jsonify({'message': 'Feedback submitted successfully'}), 200

@app.route('/api/influencer/verification-request', methods=['POST'])
def submit_verification_request():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    # Check if there's already a pending request
    existing_request = VerificationRequest.query.filter_by(
        influencer_id=influencer.id, 
        status='pending'
    ).first()
    
    if existing_request:
        return jsonify({'message': 'You already have a pending verification request'}), 400
    
    # Get form data
    full_name = request.form.get('fullName')
    additional_info = request.form.get('additionalInfo')
    social_media_links = json.loads(request.form.get('socialMediaLinks', '{}'))
    
    if not full_name:
        return jsonify({'message': 'Full name is required'}), 400
    
    # Handle ID document upload
    id_document_path = None
    if 'idDocument' in request.files:
        file = request.files['idDocument']
        if file.filename != '':
            id_document_path = save_file(file, 'verification')
    
    # Create verification request
    new_request = VerificationRequest(
        influencer_id=influencer.id,
        full_name=full_name,
        id_document_path=id_document_path,
        social_media_links=social_media_links,
        additional_info=additional_info
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    # Create notification for all admin users
    admin_users = User.query.filter_by(role='admin').all()
    for admin in admin_users:
        create_notification(
            admin.id,
            "New Verification Request",
            f"Influencer {user.name} has submitted a verification request.",
            "info",
            new_request.id,
            "verification"
        )
    
    return jsonify({
        'message': 'Verification request submitted successfully',
        'requestId': new_request.id
    }), 201

@app.route('/api/influencer/verification-status', methods=['GET'])
def get_verification_status():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'influencer':
        return jsonify({'message': 'Unauthorized'}), 401
    
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    
    if not influencer:
        return jsonify({'message': 'Influencer profile not found'}), 404
    
    # Get the latest verification request
    latest_request = VerificationRequest.query.filter_by(
        influencer_id=influencer.id
    ).order_by(VerificationRequest.created_at.desc()).first()
    
    return jsonify({
        'isVerified': influencer.is_verified,
        'latestRequest': {
            'id': latest_request.id if latest_request else None,
            'status': latest_request.status if latest_request else None,
            'createdAt': latest_request.created_at.isoformat() if latest_request else None,
            'updatedAt': latest_request.updated_at.isoformat() if latest_request else None
        } if latest_request else None
    }), 200

@app.route('/api/admin/verification-requests', methods=['GET'])
def get_verification_requests():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get query parameters
    status = request.args.get('status', 'pending')
    
    # Get verification requests
    requests = VerificationRequest.query.filter_by(status=status).order_by(VerificationRequest.created_at.desc()).all()
    
    requests_data = []
    for req in requests:
        influencer = Influencer.query.get(req.influencer_id)
        influencer_user = User.query.get(influencer.user_id)
        
        requests_data.append({
            'id': req.id,
            'influencerId': influencer.id,
            'influencerName': influencer_user.name,
            'fullName': req.full_name,
            'socialMediaLinks': req.social_media_links,
            'additionalInfo': req.additional_info,
            'idDocumentPath': req.id_document_path,
            'status': req.status,
            'adminNotes': req.admin_notes,
            'createdAt': req.created_at.isoformat(),
            'updatedAt': req.updated_at.isoformat()
        })
    
    return jsonify({'verificationRequests': requests_data}), 200

@app.route('/api/admin/verification-requests/<int:request_id>/<action>', methods=['POST'])
def handle_verification_request(request_id, action):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    verification_request = VerificationRequest.query.get(request_id)
    
    if not verification_request:
        return jsonify({'message': 'Verification request not found'}), 404
    
    data = request.json or {}
    admin_notes = data.get('adminNotes', '')
    
    influencer = Influencer.query.get(verification_request.influencer_id)
    influencer_user = User.query.get(influencer.user_id)
    
    if action == 'approve':
        verification_request.status = 'approved'
        verification_request.admin_notes = admin_notes
        influencer.is_verified = True
        
        # Notify influencer about approval
        create_notification(
            influencer.user_id,
            "Verification Approved",
            "Congratulations! Your account has been verified.",
            "success"
        )
    
    elif action == 'reject':
        verification_request.status = 'rejected'
        verification_request.admin_notes = admin_notes
        
        # Notify influencer about rejection
        create_notification(
            influencer.user_id,
            "Verification Rejected",
            f"Your verification request was not approved. Reason: {admin_notes}",
            "warning"
        )
    
    else:
        return jsonify({'message': 'Invalid action'}), 400
    
    db.session.commit()
    
    return jsonify({'message': f'Verification request {action}d successfully'}), 200

@app.route('/api/check-admin', methods=['GET'])
def check_admin():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'isAdmin': False}), 200
    
    user = User.query.get(user_id)
    
    if not user or user.role != 'admin':
        return jsonify({'isAdmin': False}), 200
    
    return jsonify({'isAdmin': True}), 200

@app.route('/api/create-admin', methods=['POST'])
def api_create_admin():
    # This should be secured in production
    data = request.json
    
    if not data or not data.get('secretKey') or data.get('secretKey') != app.config['SECRET_KEY']:
        return jsonify({'message': 'Unauthorized'}), 401
    
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    
    if not email or not name or not password:
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        admin = create_admin_user(email, name, password)
        return jsonify({
            'message': 'Admin user created successfully',
            'admin': {
                'id': admin.id,
                'name': admin.name,
                'email': admin.email
            }
        }), 201
    except Exception as e:
        return jsonify({'message': f'Error creating admin user: {str(e)}'}), 500

# Add these new admin routes to the existing app.py file

# Admin Routes
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get total users count
    total_users = User.query.count()
    
    # Get total brands count
    total_brands = User.query.filter_by(role='brand').count()
    
    # Get total influencers count
    total_influencers = User.query.filter_by(role='influencer').count()
    
    # Get pending verification requests count
    pending_verifications = VerificationRequest.query.filter_by(status='pending').count()
    
    return jsonify({
        'stats': {
            'totalUsers': total_users,
            'totalBrands': total_brands,
            'totalInfluencers': total_influencers,
            'pendingVerifications': pending_verifications
        }
    }), 200

@app.route('/api/admin/recent-activity', methods=['GET'])
def get_admin_recent_activity():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get recent activities (using verification requests, user registrations, etc.)
    activities = []
    
    # Get recent verification requests
    verification_requests = VerificationRequest.query.order_by(VerificationRequest.created_at.desc()).limit(5).all()
    for req in verification_requests:
        influencer = Influencer.query.get(req.influencer_id)
        influencer_user = User.query.get(influencer.user_id)
        
        if req.status == 'pending':
            message = f"<span class='font-medium'>{influencer_user.name}</span> submitted a verification request"
        elif req.status == 'approved':
            message = f"<span class='font-medium'>{influencer_user.name}</span> was verified as an influencer"
        else:
            message = f"<span class='font-medium'>{influencer_user.name}</span> had a verification request rejected"
        
        activities.append({
            'type': 'verification',
            'message': message,
            'timestamp': req.created_at.isoformat()
        })
    
    # Get recent user registrations
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    for user in recent_users:
        activities.append({
            'type': 'user',
            'message': f"<span class='font-medium'>{user.name}</span> registered as a {user.role}",
            'timestamp': user.created_at.isoformat()
        })
    
    # Sort activities by timestamp
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Limit to 10 most recent activities
    activities = activities[:10]
    
    return jsonify({'activities': activities}), 200

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get all users with their related profiles
    users_data = []
    users = User.query.all()
    
    for user in users:
        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
        
        # Add role-specific data
        if user.role == 'brand' and user.brand:
            user_data['brand'] = {
                'id': user.brand.id,
                'industry': user.brand.industry,
                'website': user.brand.website,
                'location': user.brand.location,
                'is_verified': user.brand.is_verified
            }
        elif user.role == 'influencer' and user.influencer:
            user_data['influencer'] = {
                'id': user.influencer.id,
                'niche': user.influencer.niche,
                'followers': user.influencer.followers,
                'engagement_rate': user.influencer.engagement_rate,
                'location': user.influencer.location,
                'rating': user.influencer.rating,
                'is_verified': user.influencer.is_verified
            }
        
        users_data.append(user_data)
    
    return jsonify({'users': users_data}), 200

@app.route('/api/admin/users/<int:user_id>/<action>', methods=['POST'])
def admin_user_action(user_id, action):
    admin_id = session.get('user_id')
    
    if not admin_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    admin = User.query.get(admin_id)
    
    # Check if the user is an admin
    if not admin or admin.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get the target user
    target_user = User.query.get(user_id)
    
    if not target_user:
        return jsonify({'message': 'User not found'}), 404
    
    # Prevent admins from deactivating themselves
    if admin_id == user_id and action == 'deactivate':
        return jsonify({'message': 'Cannot deactivate your own account'}), 400
    
    if action == 'activate':
        target_user.is_active = True
        db.session.commit()
        return jsonify({'message': 'User activated successfully'}), 200
    elif action == 'deactivate':
        target_user.is_active = False
        db.session.commit()
        return jsonify({'message': 'User deactivated successfully'}), 200
    else:
        return jsonify({'message': 'Invalid action'}), 400

@app.route('/api/admin/reports', methods=['GET'])
def get_admin_reports():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get report type and time range from query parameters
    report_type = request.args.get('type', 'users')
    time_range = request.args.get('range', 'month')
    
    # Generate report data based on type and range
    if report_type == 'users':
        return generate_users_report(time_range)
    elif report_type == 'campaigns':
        return generate_campaigns_report(time_range)
    elif report_type == 'verifications':
        return generate_verifications_report(time_range)
    else:
        return jsonify({'message': 'Invalid report type'}), 400

@app.route('/api/admin/reports/download', methods=['GET'])
def download_admin_report():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get report type and time range from query parameters
    report_type = request.args.get('type', 'users')
    time_range = request.args.get('range', 'month')
    
    # Generate CSV data based on report type
    if report_type == 'users':
        return generate_users_csv(time_range)
    elif report_type == 'campaigns':
        return generate_campaigns_csv(time_range)
    elif report_type == 'verifications':
        return generate_verifications_csv(time_range)
    else:
        return jsonify({'message': 'Invalid report type'}), 400

@app.route('/api/admin/settings', methods=['GET'])
def get_admin_settings():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # In a real app, you would fetch settings from a database
    # For now, we'll return default settings
    settings = {
        'general': {
            'siteName': 'Influne',
            'siteDescription': 'Influencer Marketing Platform',
            'contactEmail': 'support@influne.com',
            'allowRegistration': True,
            'requireEmailVerification': True,
        },
        'notifications': {
            'sendWelcomeEmail': True,
            'sendVerificationApprovalEmail': True,
            'sendVerificationRejectionEmail': True,
            'sendCampaignNotifications': True,
            'adminNotifyNewUsers': True,
            'adminNotifyVerificationRequests': True,
        },
        'security': {
            'passwordMinLength': 8,
            'requireStrongPasswords': True,
            'sessionTimeout': 60,  # minutes
            'maxLoginAttempts': 5,
        },
    }
    
    return jsonify({'settings': settings}), 200

@app.route('/api/admin/settings', methods=['POST'])
def update_admin_settings():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    data = request.json
    
    # In a real app, you would validate and save settings to a database
    # For now, we'll just return success
    
    return jsonify({'message': 'Settings updated successfully'}), 200

@app.route('/api/admin/notifications', methods=['GET'])
def get_admin_notifications():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Get admin notifications
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    
    notifications_data = []
    for notification in notifications:
        notifications_data.append({
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'type': notification.type,
            'is_read': notification.is_read,
            'related_id': notification.related_id,
            'related_type': notification.related_type,
            'created_at': notification.created_at.isoformat()
        })
    
    return jsonify({'notifications': notifications_data}), 200

@app.route('/api/admin/notifications/<int:notification_id>/read', methods=['POST'])
def mark_admin_notification_read(notification_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    notification = Notification.query.get(notification_id)
    
    if not notification or notification.user_id != user_id:
        return jsonify({'message': 'Notification not found'}), 404
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Notification marked as read'}), 200

@app.route('/api/admin/notifications/read-all', methods=['POST'])
def mark_all_admin_notifications_read():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    
    return jsonify({'message': 'All notifications marked as read'}), 200

@app.route('/api/admin/notifications/<int:notification_id>', methods=['DELETE'])
def delete_admin_notification(notification_id):
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    notification = Notification.query.get(notification_id)
    
    if not notification or notification.user_id != user_id:
        return jsonify({'message': 'Notification not found'}), 404
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': 'Notification deleted'}), 200

@app.route('/api/admin/notifications/delete-all', methods=['DELETE'])
def delete_all_admin_notifications():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    
    # Check if the user is an admin
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401
    
    Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'All notifications deleted'}), 200

# Helper functions for reports
def generate_users_report(time_range):
    # Calculate date range
    end_date = datetime.utcnow()
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Get user counts
    total_users = User.query.filter(User.created_at >= start_date).count()
    total_brands = User.query.filter(User.role == 'brand', User.created_at >= start_date).count()
    total_influencers = User.query.filter(User.role == 'influencer', User.created_at >= start_date).count()
    
    # Get previous period for comparison
    prev_end_date = start_date
    if time_range == 'week':
        prev_start_date = prev_end_date - timedelta(days=7)
    elif time_range == 'month':
        prev_start_date = prev_end_date - timedelta(days=30)
    elif time_range == 'year':
        prev_start_date = prev_end_date - timedelta(days=365)
    else:
        prev_start_date = prev_end_date - timedelta(days=30)
    
    prev_total_users = User.query.filter(User.created_at >= prev_start_date, User.created_at < start_date).count()
    
    # Calculate growth percentage
    if prev_total_users > 0:
        growth_percentage = ((total_users - prev_total_users) / prev_total_users) * 100
    else:
        growth_percentage = 100  # If no previous users, growth is 100%
    
    # Get recent users for the table
    recent_users = User.query.filter(User.created_at >= start_date).order_by(User.created_at.desc()).limit(10).all()
    
    user_data = []
    for user in recent_users:
        user_data.append([
            user.id,
            user.name,
            user.email,
            user.role,
            user.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return jsonify({
        'summary': [
            {'label': 'Total New Users', 'value': total_users, 'change': round(growth_percentage, 1)},
            {'label': 'New Brands', 'value': total_brands},
            {'label': 'New Influencers', 'value': total_influencers}
        ],
        'columns': ['ID', 'Name', 'Email', 'Role', 'Joined Date'],
        'data': user_data
    }), 200

def generate_campaigns_report(time_range):
    # Calculate date range
    end_date = datetime.utcnow()
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Get campaign counts
    total_campaigns = Campaign.query.filter(Campaign.created_at >= start_date).count()
    active_campaigns = Campaign.query.filter(Campaign.created_at >= start_date, Campaign.status == 'active').count()
    completed_campaigns = Campaign.query.filter(Campaign.created_at >= start_date, Campaign.status == 'completed').count()
    
    # Get recent campaigns for the table
    recent_campaigns = Campaign.query.filter(Campaign.created_at >= start_date).order_by(Campaign.created_at.desc()).limit(10).all()
    
    campaign_data = []
    for campaign in recent_campaigns:
        brand = Brand.query.get(campaign.brand_id)
        brand_user = User.query.get(brand.user_id)
        
        campaign_data.append([
            campaign.id,
            campaign.name,
            brand_user.name,
            campaign.status,
            f"${campaign.budget:.2f}",
            campaign.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return jsonify({
        'summary': [
            {'label': 'Total Campaigns', 'value': total_campaigns},
            {'label': 'Active Campaigns', 'value': active_campaigns},
            {'label': 'Completed Campaigns', 'value': completed_campaigns}
        ],
        'columns': ['ID', 'Campaign Name', 'Brand', 'Status', 'Budget', 'Created Date'],
        'data': campaign_data
    }), 200

def generate_verifications_report(time_range):
    # Calculate date range
    end_date = datetime.utcnow()
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Get verification counts
    total_requests = VerificationRequest.query.filter(VerificationRequest.created_at >= start_date).count()
    approved_requests = VerificationRequest.query.filter(
        VerificationRequest.created_at >= start_date,
        VerificationRequest.status == 'approved'
    ).count()
    rejected_requests = VerificationRequest.query.filter(
        VerificationRequest.created_at >= start_date,
        VerificationRequest.status == 'rejected'
    ).count()
    
    # Calculate approval rate
    if total_requests > 0:
        approval_rate = (approved_requests / total_requests) * 100
    else:
        approval_rate = 0
    
    # Get recent verification requests for the table
    recent_requests = VerificationRequest.query.filter(
        VerificationRequest.created_at >= start_date
    ).order_by(VerificationRequest.created_at.desc()).limit(10).all()
    
    request_data = []
    for req in recent_requests:
        influencer = Influencer.query.get(req.influencer_id)
        influencer_user = User.query.get(influencer.user_id)
        
        request_data.append([
            req.id,
            influencer_user.name,
            req.full_name,
            req.status,
            req.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            req.updated_at.strftime('%Y-%m-%d %H:%M:%S') if req.status != 'pending' else 'N/A'
        ])
    
    return jsonify({
        'summary': [
            {'label': 'Total Requests', 'value': total_requests},
            {'label': 'Approved', 'value': approved_requests},
            {'label': 'Rejected', 'value': rejected_requests},
            {'label': 'Approval Rate', 'value': f"{approval_rate:.1f}%"}
        ],
        'columns': ['ID', 'Influencer', 'Full Name', 'Status', 'Submitted Date', 'Processed Date'],
        'data': request_data
    }), 200

def generate_users_csv(time_range):
    # Calculate date range
    end_date = datetime.utcnow()
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Get users
    users = User.query.filter(User.created_at >= start_date).order_by(User.created_at.desc()).all()
    
    # Create CSV content
    csv_content = "ID,Name,Email,Role,Status,Created At\n"
    for user in users:
        status = "Active" if user.is_active else "Inactive"
        csv_content += f"{user.id},{user.name},{user.email},{user.role},{status},{user.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
    
    # Create response
    response = make_response(csv_content)
    response.headers["Content-Disposition"] = f"attachment; filename=users-report-{time_range}.csv"
    response.headers["Content-Type"] = "text/csv"
    
    return response

def generate_campaigns_csv(time_range):
    # Calculate date range
    end_date = datetime.utcnow()
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Get campaigns
    campaigns = Campaign.query.filter(Campaign.created_at >= start_date).order_by(Campaign.created_at.desc()).all()
    
    # Create CSV content
    csv_content = "ID,Name,Brand,Status,Budget,Start Date,End Date,Created At\n"
    for campaign in campaigns:
        brand = Brand.query.get(campaign.brand_id)
        brand_user = User.query.get(brand.user_id)
        
        csv_content += f"{campaign.id},{campaign.name},{brand_user.name},{campaign.status},{campaign.budget},{campaign.start_date.strftime('%Y-%m-%d')},{campaign.end_date.strftime('%Y-%m-%d')},{campaign.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
    
    # Create response
    response = make_response(csv_content)
    response.headers["Content-Disposition"] = f"attachment; filename=campaigns-report-{time_range}.csv"
    response.headers["Content-Type"] = "text/csv"
    
    return response

def generate_verifications_csv(time_range):
    # Calculate date range
    end_date = datetime.utcnow()
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Get verification requests
    requests = VerificationRequest.query.filter(VerificationRequest.created_at >= start_date).order_by(VerificationRequest.created_at.desc()).all()
    
    # Create CSV content
    csv_content = "ID,Influencer,Full Name,Status,Submitted Date,Processed Date\n"
    for req in requests:
        influencer = Influencer.query.get(req.influencer_id)
        influencer_user = User.query.get(influencer.user_id)
        
        processed_date = req.updated_at.strftime('%Y-%m-%d %H:%M:%S') if req.status != 'pending' else 'N/A'
        csv_content += f"{req.id},{influencer_user.name},{req.full_name},{req.status},{req.created_at.strftime('%Y-%m-%d %H:%M:%S')},{processed_date}\n"
    
    # Create response
    response = make_response(csv_content)
    response.headers["Content-Disposition"] = f"attachment; filename=verifications-report-{time_range}.csv"
    response.headers["Content-Type"] = "text/csv"
    
    return response

def create_admin_user(email, name, password):
    """Create an admin user if one doesn't exist with the given email"""
    with app.app_context():
        # Check if admin already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"User with email {email} already exists.")
            return existing_user
        
        # Create new admin user
        admin_user = User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            role='admin'
        )
        
        db.session.add(admin_user)
        db.session.commit()
        print(f"Admin user {name} created successfully.")
        return admin_user

# Create database tables
with app.app_context():
    db.create_all()

# Add sample data for development
def add_sample_data():
    import random
    
    with app.app_context():
        # Check if data already exists
        if User.query.count() > 0:
            return
        
        # Create sample users
        brand_user = User(
            name='TechBrand',
            email='brand@example.com',
            password=generate_password_hash('password'),
            role='brand'
        )
        
        influencer_user1 = User(
            name='Sarah Johnson',
            email='influencer1@example.com',
            password=generate_password_hash('password'),
            role='influencer'
        )
        
        influencer_user2 = User(
            name='Alex Rivera',
            email='influencer2@example.com',
            password=generate_password_hash('password'),
            role='influencer'
        )
        
        db.session.add_all([brand_user, influencer_user1, influencer_user2])
        db.session.commit()
        
        # Create brand profile
        brand = Brand(
            user_id=brand_user.id,
            industry='Technology',
            website='https://techbrand.example.com',
            description='A leading technology company specializing in innovative solutions.',
            location='San Francisco, CA'
        )
        
        db.session.add(brand)
        
        # Create influencer profiles
        influencer1 = Influencer(
            user_id=influencer_user1.id,
            niche='Technology',
            bio='Tech enthusiast and content creator sharing the latest gadget reviews and tech news.',
            followers=50000,
            engagement_rate=3.5,
            location='New York, NY',
            rating=4.8,
            social_media=json.dumps({
                'instagram': 'sarahtechreviews',
                'tiktok': 'sarahtech',
                'youtube': 'SarahTechReviews',
                'twitter': 'sarahtech'
            }),
            pricing=500,
            is_verified=False
        )
        
        influencer2 = Influencer(
            user_id=influencer_user2.id,
            niche='Lifestyle',
            bio='Lifestyle blogger sharing travel experiences, fashion tips, and daily inspiration.',
            followers=75000,
            engagement_rate=4.2,
            location='Los Angeles, CA',
            rating=4.5,
            social_media=json.dumps({
                'instagram': 'alexlifestyle',
                'tiktok': 'alexlifestyle',
                'youtube': 'AlexLifestyle',
                'twitter': 'alexlifestyle'
            }),
            pricing=750,
            is_verified=False
        )
        
        db.session.add_all([influencer1, influencer2])
        
        # Create sample campaign
        campaign = Campaign(
            brand_id=brand.id,
            name='New Product Launch Campaign',
            description='We are launching a new smartphone and need influencers to create content showcasing its features.',
            budget=5000,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            requirements='Create 1 detailed review video and 3 Instagram posts featuring our new smartphone.',
            target_audience=json.dumps({
                'ageRange': ['18-24', '25-34'],
                'gender': ['All'],
                'interests': ['Technology', 'Gaming', 'Photography']
            }),
            status='active'
        )
        
        db.session.add(campaign)
        db.session.commit()
        
        # Create campaign analytics
        analytics = CampaignAnalytics(
            campaign_id=campaign.id,
            impressions=random.randint(5000, 10000),
            reach=random.randint(3000, 8000),
            engagement=random.randint(500, 2000),
            clicks=random.randint(200, 1000),
            conversions=random.randint(10, 100),
            roi=random.uniform(1.5, 4.0)
        )
        
        db.session.add(analytics)
        
        # Create campaign-influencer relationships
        campaign_influencer1 = CampaignInfluencer(
            campaign_id=campaign.id,
            influencer_id=influencer1.id,
            status='approved',
            compensation=800
        )
        
        campaign_influencer2 = CampaignInfluencer(
            campaign_id=campaign.id,
            influencer_id=influencer2.id,
            status='pending'
        )
        
        db.session.add_all([campaign_influencer1, campaign_influencer2])
        
        # Create content items
        content1 = ContentItem(
            campaign_influencer_id=campaign_influencer1.id,
            platform='instagram',
            content_type='post',
            url='https://instagram.com/p/example1',
            engagement=1200
        )
        
        content2 = ContentItem(
            campaign_influencer_id=campaign_influencer1.id,
            platform='youtube',
            content_type='video',
            url='https://youtube.com/watch?v=example1',
            engagement=3500
        )
        
        db.session.add_all([content1, content2])
        
        # Create portfolio items
        portfolio1 = PortfolioItem(
            influencer_id=influencer1.id,
            title='Tech Review: Latest Smartphone',
            description='In-depth review of the latest smartphone with performance tests and camera samples.',
            platform='youtube',
            url='https://youtube.com/watch?v=portfolio1'
        )
        
        portfolio2 = PortfolioItem(
            influencer_id=influencer1.id,
            title='Tech Tips Instagram Series',
            description='A series of Instagram posts sharing tech tips and tricks.',
            platform='instagram',
            url='https://instagram.com/p/portfolio1'
        )
        
        db.session.add_all([portfolio1, portfolio2])
        
        # Create notifications
        notification1 = Notification(
            user_id=brand_user.id,
            title='New Application',
            message='Sarah Johnson has applied to your campaign "New Product Launch Campaign".',
            type='info',
            related_id=campaign.id,
            related_type='campaign'
        )
        
        notification2 = Notification(
            user_id=influencer_user1.id,
            title='Application Approved',
            message='Your application for "New Product Launch Campaign" has been approved!',
            type='success',
            related_id=campaign.id,
            related_type='campaign'
        )
        
        db.session.add_all([notification1, notification2])
        
        # Create conversation
        conversation = Conversation(
            user1_id=brand_user.id,
            user2_id=influencer_user1.id
        )
        
        db.session.add(conversation)
        db.session.commit()
        
        # Create messages
        message1 = Message(
            conversation_id=conversation.id,
            sender_id=brand_user.id,
            recipient_id=influencer_user1.id,
            content='Hi Sarah, I\'m interested in working with you on our new product launch campaign.',
            is_read=True,
            timestamp=datetime.utcnow() - timedelta(days=2, hours=3)
        )
        
        message2 = Message(
            conversation_id=conversation.id,
            sender_id=influencer_user1.id,
            recipient_id=brand_user.id,
            content='Hi TechBrand, I\'d love to hear more about the campaign!',
            is_read=True,
            timestamp=datetime.utcnow() - timedelta(days=2, hours=2)
        )
        
        message3 = Message(
            conversation_id=conversation.id,
            sender_id=brand_user.id,
            recipient_id=influencer_user1.id,
            content='Great! Our new smartphone has some amazing features that I think your audience would love. Would you be interested in creating a detailed review video?',
            is_read=True,
            timestamp=datetime.utcnow() - timedelta(days=1, hours=5)
        )
        
        db.session.add_all([message1, message2, message3])
        
        # Create admin user
        admin_user = User(
            name='Admin User',
            email='admin@example.com',
            password=generate_password_hash('adminpassword'),
            role='admin'
        )
        
        db.session.add(admin_user)
        db.session.commit()

# Add sample data for development
if __name__ == '__main__':
    add_sample_data()
    create_admin_user('admin@example.com', 'Admin User', 'adminpassword')
    app.run(debug=True)
