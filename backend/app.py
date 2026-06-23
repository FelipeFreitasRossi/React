import asyncio
import json
import random
import time
import threading
import jwt
import bcrypt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import yfinance as yf
import pandas as pd
import websockets

app = Flask(__name__)
CORS(app)

# ========== CONFIGURAÇÃO DO BANCO ==========
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'sua-chave-secreta-aqui-mude-em-producao'
db = SQLAlchemy(app)

# ========== MODELO DE USUÁRIO ==========
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {'id': self.id, 'username': self.username}

# Cria as tabelas (rode uma vez)
with app.app_context():
    db.create_all()

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
    except:
        return None

# ========== ROTAS DE AUTENTICAÇÃO ==========
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Usuário e senha são obrigatórios'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Usuário já existe'}), 400
    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    token = generate_token(new_user.id)
    return jsonify({'message': 'Usuário criado', 'token': token, 'user': new_user.to_dict()}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Usuário ou senha inválidos'}), 401
    token = generate_token(user.id)
    return jsonify({'message': 'Login realizado', 'token': token, 'user': user.to_dict()}), 200

# ========== ROTA DE INFORMAÇÕES DA EMPRESA ==========
@app.route('/api/company-info')
def company_info():
    symbol = request.args.get('symbol', 'AAPL')
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return jsonify({
            'name': info.get('longName', symbol),
            'sector': info.get('sector', ''),
            'industry': info.get('industry', '')
        })
    except:
        return jsonify({'error': 'Não foi possível obter informações'}), 500

# ========== ROTA HISTÓRICA ==========
@app.route('/api/historical')
def historical():
    symbol = request.args.get('symbol', 'AAPL')
    period = request.args.get('period', '1mo')
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        df = df.reset_index()
        df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')
        data = df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']].to_dict('records')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== WEBSOCKET ==========
async def price_stream(websocket, path):
    symbol = "AAPL"
    while True:
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period='1d', interval='1m')
            if not data.empty:
                last = data['Close'].iloc[-1]
                change = random.uniform(-0.5, 0.5)
                price = last + change
            else:
                price = random.uniform(100, 200)
            message = {
                'symbol': symbol,
                'price': round(price, 2),
                'timestamp': time.time()
            }
            await websocket.send(json.dumps(message))
            await asyncio.sleep(1)
        except websockets.exceptions.ConnectionClosed:
            break

async def main():
    async with websockets.serve(price_stream, "localhost", 8765):
        print("✅ WebSocket server started on ws://localhost:8765")
        await asyncio.Future()

def run_flask():
    app.run(debug=True, port=5000, use_reloader=False)

if __name__ == '__main__':
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()
    print("✅ Flask server started on http://localhost:5000")
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("🔴 Servidores encerrados.")