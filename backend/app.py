import asyncio
import json
import random
import time
import threading
import jwt
import bcrypt
import re
import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import yfinance as yf
import pandas as pd
import websockets

# ========== CONFIGURAÇÃO DO APP ==========
app = Flask(__name__)
CORS(app)

# ========== CONFIGURAÇÃO DO BANCO DE DADOS ==========
# Lê a URL do banco de dados da variável de ambiente DATABASE_URL
# Se não existir, usa SQLite local para desenvolvimento
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    # Fallback para desenvolvimento local com SQLite
    database_url = 'sqlite:///findash.db'
else:
    # Ajusta a URL para o formato esperado pelo SQLAlchemy
    # O Render fornece URLs no formato 'postgres://...'
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False  # Defina como True para ver logs SQL (desative em produção)

# Chave secreta para JWT (use variável de ambiente em produção)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'sua-chave-secreta-mude-em-producao')

db = SQLAlchemy(app)

# ========== MODELO DE USUÁRIO (compatível com PostgreSQL) ==========
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)

    def __init__(self, username, email, password, full_name=None):
        self.username = username
        self.email = email
        self.set_password(password)
        self.full_name = full_name

    def set_password(self, password):
        if len(password) < 6:
            raise ValueError('A senha deve ter pelo menos 6 caracteres')
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def update_last_login(self):
        self.last_login = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    @staticmethod
    def validate_email(email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def validate_username(username):
        pattern = r'^[a-zA-Z0-9_]{3,30}$'
        return re.match(pattern, username) is not None

# Cria as tabelas (se não existirem)
with app.app_context():
    db.create_all()
    print("✅ Tabelas criadas/verificadas com sucesso!")

# ========== FUNÇÕES JWT ==========
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# ========== CACHE PARA YAHOO FINANCE ==========
cache = {
    'historical': {},
    'company_info': {},
    'crypto_prices': {},
    'last_update': {}
}
CACHE_TTL = 60  # segundos

# ========== FUNÇÕES AUXILIARES PARA YAHOO FINANCE ==========
def get_yf_ticker(symbol):
    ticker = yf.Ticker(symbol)
    ticker.session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    return ticker

def fetch_with_cache(key, fetch_func, ttl=CACHE_TTL):
    now = time.time()
    if key in cache and cache['last_update'].get(key, 0) + ttl > now:
        return cache[key]
    try:
        time.sleep(0.5)
        data = fetch_func()
        if data:
            cache[key] = data
            cache['last_update'][key] = now
            return data
        return None
    except Exception as e:
        print(f"Erro ao buscar {key}: {e}")
        return cache.get(key, None)

def generate_mock_data(symbol, period='1mo'):
    import random
    from datetime import datetime, timedelta
    period_map = {'1d': 1, '5d': 5, '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, '2y': 730, '5y': 1825}
    days = period_map.get(period, 30)
    base_price = {
        'AAPL': 180, 'TSLA': 250, 'MSFT': 420, 'GOOGL': 140, 'AMZN': 180,
        'BTC-USD': 60000, 'ETH-USD': 3000, 'USDBRL=X': 5.20, 'EURUSD=X': 1.08
    }.get(symbol, 100)
    data = []
    current = base_price
    start_date = datetime.now() - timedelta(days=days)
    for i in range(days):
        date = start_date + timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        change = random.uniform(-0.03, 0.03)
        open_price = current * (1 + random.uniform(-0.01, 0.01))
        high = open_price * (1 + random.uniform(0, 0.02))
        low = open_price * (1 - random.uniform(0, 0.02))
        close = open_price * (1 + change)
        current = close
        volume = random.randint(1000000, 50000000)
        data.append({
            'Date': date_str,
            'Open': round(open_price, 2),
            'High': round(high, 2),
            'Low': round(low, 2),
            'Close': round(close, 2),
            'Volume': volume
        })
    return data

def get_historical(symbol, period='1mo'):
    key = f"historical_{symbol}_{period}"
    def fetch():
        ticker = get_yf_ticker(symbol)
        df = ticker.history(period=period)
        if df.empty:
            return None
        df = df.reset_index()
        df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')
        return df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']].to_dict('records')
    data = fetch_with_cache(key, fetch)
    if data is None:
        print(f"⚠️ Gerando dados simulados para {symbol}")
        return generate_mock_data(symbol, period)
    return data

def get_company_info(symbol):
    key = f"info_{symbol}"
    def fetch():
        ticker = get_yf_ticker(symbol)
        info = ticker.info
        return {
            'name': info.get('longName', symbol),
            'sector': info.get('sector', ''),
            'industry': info.get('industry', '')
        }
    data = fetch_with_cache(key, fetch)
    if data is None:
        return {'name': symbol, 'sector': 'N/A', 'industry': 'N/A'}
    return data

def get_crypto_prices():
    symbols = [
        {'symbol': 'BTC-USD', 'name': 'Bitcoin'},
        {'symbol': 'ETH-USD', 'name': 'Ethereum'},
        {'symbol': 'BNB-USD', 'name': 'BNB'},
        {'symbol': 'SOL-USD', 'name': 'Solana'},
        {'symbol': 'XRP-USD', 'name': 'Ripple'},
        {'symbol': 'ADA-USD', 'name': 'Cardano'},
        {'symbol': 'DOGE-USD', 'name': 'Dogecoin'},
        {'symbol': 'USDBRL=X', 'name': 'Dólar USD/BRL'},
        {'symbol': 'EURUSD=X', 'name': 'Euro/USD'},
    ]
    key = "crypto_prices_all"
    def fetch():
        prices = []
        for item in symbols:
            try:
                ticker = get_yf_ticker(item['symbol'])
                data = ticker.history(period='1d')
                if not data.empty:
                    price = data['Close'].iloc[-1]
                    if len(data) > 1:
                        prev_close = data['Close'].iloc[-2]
                        change = ((price - prev_close) / prev_close) * 100
                    else:
                        change = random.uniform(-3, 3)
                else:
                    price = random.uniform(10, 1000)
                    change = random.uniform(-3, 3)
            except:
                price = random.uniform(10, 1000)
                change = random.uniform(-3, 3)
            prices.append({
                'symbol': item['symbol'],
                'name': item['name'],
                'price': round(price, 2),
                'change_24h': round(change, 2)
            })
        return prices
    data = fetch_with_cache(key, fetch)
    if data is None:
        return [
            {'symbol': 'BTC-USD', 'name': 'Bitcoin', 'price': 60000, 'change_24h': 2.5},
            {'symbol': 'ETH-USD', 'name': 'Ethereum', 'price': 3000, 'change_24h': -1.2},
            {'symbol': 'USDBRL=X', 'name': 'Dólar/BRL', 'price': 5.20, 'change_24h': 0.3},
        ]
    return data

# ========== ROTAS DE AUTENTICAÇÃO ==========
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip() or None

    if not username or not email or not password:
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400

    if not User.validate_username(username):
        return jsonify({'error': 'Usuário inválido. Use apenas letras, números e underscore (3-30 caracteres)'}), 400

    if not User.validate_email(email):
        return jsonify({'error': 'E-mail inválido'}), 400

    if len(password) < 6:
        return jsonify({'error': 'A senha deve ter pelo menos 6 caracteres'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Usuário já existe'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'E-mail já cadastrado'}), 400

    try:
        new_user = User(username=username, email=email, password=password, full_name=full_name)
        db.session.add(new_user)
        db.session.commit()

        token = generate_token(new_user.id)
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'token': token,
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar usuário: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'E-mail e senha são obrigatórios'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'E-mail ou senha inválidos'}), 401

    if not user.is_active:
        return jsonify({'error': 'Conta desativada. Entre em contato com o suporte.'}), 403

    user.update_last_login()
    token = generate_token(user.id)
    return jsonify({
        'message': 'Login realizado com sucesso',
        'token': token,
        'user': user.to_dict()
    }), 200

# ========== ROTA DE VALIDAÇÃO DE SESSÃO ==========
@app.route('/api/me', methods=['GET'])
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Token não fornecido'}), 401
    try:
        token = auth_header.split(' ')[1]
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        if not user.is_active:
            return jsonify({'error': 'Conta desativada'}), 403
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== ROTA DE ATUALIZAÇÃO DE PERFIL ==========
@app.route('/api/update-profile', methods=['PUT'])
def update_profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Token não fornecido'}), 401

    try:
        token = auth_header.split(' ')[1]
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Token inválido ou expirado'}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        data = request.get_json()
        username = data.get('username', '').strip()
        full_name = data.get('full_name', '').strip() or None

        if username:
            if not User.validate_username(username):
                return jsonify({'error': 'Usuário inválido. Use apenas letras, números e underscore (3-30 caracteres)'}), 400
            existing = User.query.filter(User.username == username, User.id != user.id).first()
            if existing:
                return jsonify({'error': 'Nome de usuário já está em uso'}), 400
            user.username = username

        if full_name is not None:
            user.full_name = full_name

        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Perfil atualizado com sucesso',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========== ROTAS DE SEGURANÇA ==========
@app.route('/api/change-password', methods=['POST'])
def change_password():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Token não fornecido'}), 401

    try:
        token = auth_header.split(' ')[1]
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Token inválido ou expirado'}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({'error': 'Senha atual e nova senha são obrigatórias'}), 400

        if not user.check_password(current_password):
            return jsonify({'error': 'Senha atual incorreta'}), 401

        if len(new_password) < 6:
            return jsonify({'error': 'Nova senha deve ter pelo menos 6 caracteres'}), 400

        if current_password == new_password:
            return jsonify({'error': 'A nova senha deve ser diferente da atual'}), 400

        user.set_password(new_password)
        db.session.commit()
        return jsonify({'message': 'Senha alterada com sucesso'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-account', methods=['DELETE'])
def delete_account():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Token não fornecido'}), 401

    try:
        token = auth_header.split(' ')[1]
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Token inválido ou expirado'}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Conta excluída com sucesso'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========== ROTAS DE DADOS ==========
@app.route('/api/company-info')
def company_info():
    symbol = request.args.get('symbol', 'AAPL')
    return jsonify(get_company_info(symbol))

@app.route('/api/historical')
def historical():
    symbol = request.args.get('symbol', 'AAPL')
    period = request.args.get('period', '1mo')
    data = get_historical(symbol, period)
    return jsonify(data)

@app.route('/api/crypto-prices')
def crypto_prices():
    return jsonify(get_crypto_prices())

# ========== WEBSOCKET ==========
async def price_stream(websocket, path):
    symbols = ['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD', 'USDBRL=X']
    while True:
        try:
            prices = {}
            for sym in symbols:
                try:
                    ticker = get_yf_ticker(sym)
                    data = ticker.history(period='1d', interval='1m')
                    if not data.empty:
                        price = data['Close'].iloc[-1]
                    else:
                        price = random.uniform(100, 1000)
                except:
                    price = random.uniform(100, 1000)
                prices[sym] = round(price, 2)
            message = {
                'symbols': prices,
                'timestamp': time.time()
            }
            await websocket.send(json.dumps(message))
            await asyncio.sleep(2)
        except websockets.exceptions.ConnectionClosed:
            break

async def main():
    async with websockets.serve(price_stream, "localhost", 8765):
        print("✅ WebSocket server started on ws://localhost:8765")
        await asyncio.Future()

def run_flask():
    # Em produção, o Gunicorn executa essa aplicação. Para desenvolvimento local, podemos rodar o Flask.
    # Se esta for a execução principal, o Flask irá iniciar.
    app.run(debug=True, port=5000, use_reloader=False)

if __name__ == '__main__':
    # Em desenvolvimento local, rodamos o Flask e o WebSocket em threads separadas
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()
    print("✅ Flask server started on http://localhost:5000")
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("🔴 Servidores encerrados.")