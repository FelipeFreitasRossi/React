FinDash - Plataforma de Análise Financeira
FinDash é uma aplicação web completa para monitoramento de investimentos, com dados em tempo real, gráficos interativos e autenticação segura. O projeto utiliza React no frontend e Flask no backend, com banco de dados PostgreSQL.

Índice
Demonstração

Características

Tecnologias Utilizadas

Arquitetura

Estrutura do Projeto

Como Executar Localmente

Deploy

API Endpoints

Contribuição

Licença

Demonstração
Frontend (Vercel): https://react-kilc-5gs42so99-projetosfeitos.vercel.app

Backend (Render): https://react-1-1y06.onrender.com/api/status

Características
Autenticação segura com JWT e bcrypt

Cadastro e login com validação de email e senha

Dashboard financeiro com gráficos de preços (AreaChart, SMA)

Dados em tempo real via WebSocket (cotações de ações e criptomoedas)

Lista de moedas com preços atualizados a cada 2 segundos

Perfil do usuário com edição de nome, foto e informações

Configurações com tema claro/escuro e idioma (PT/EN)

Responsividade para dispositivos móveis

Segurança com tokens JWT e criptografia de senhas

Tradução completa para português e inglês

Tecnologias Utilizadas
Frontend
React 18 com hooks e contexto

React Router DOM para navegação

Styled Components para estilização

Recharts para gráficos interativos

React Icons para ícones vetoriais

Socket.io-client para WebSocket

Fetch API para requisições HTTP

Backend
Flask 2.3.3 – framework web Python

Flask-SQLAlchemy – ORM para banco de dados

Flask-CORS – habilitar CORS

PyJWT – geração e validação de tokens

Bcrypt – hash de senhas

yfinance – dados financeiros (ações e criptomoedas)

WebSockets – comunicação em tempo real

Gunicorn – servidor WSGI para produção

Banco de Dados
PostgreSQL (em produção via Render)

SQLite (desenvolvimento local)

Infraestrutura
Vercel – hospedagem do frontend

Render – hospedagem do backend e banco de dados

Git – controle de versão

Arquitetura

+------------------+     +------------------+     +------------------+
|   Frontend       |     |   Backend        |     |   Database       |
|   (React)        | <-> |   (Flask)        | <-> |   (PostgreSQL)   |
|   Vercel         |     |   Render         |     |   Render         |
+------------------+     +------------------+     +------------------+
        |                         |
        |                         |
        +------ WebSocket --------+
O frontend faz requisições REST para o backend (login, cadastro, dados históricos, perfil).

O WebSocket mantém uma conexão persistente para atualizações de preços em tempo real.

O backend consulta a API do Yahoo Finance (via yfinance) e entrega os dados com cache.

Estrutura do Projeto

projeto/
├── backend/
│   ├── app.py                 # Aplicação Flask principal
│   ├── requirements.txt       # Dependências Python
│   └── .env.example           # Exemplo de variáveis de ambiente
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Loader.js
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Dashboard.js
│   │   │   └── LoginForm.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── About.js
│   │   │   ├── Contact.js
│   │   │   ├── Profile.js
│   │   │   ├── Settings.js
│   │   │   └── Crypto.js
│   │   ├── contexts/
│   │   │   └── ThemeContext.js
│   │   ├── translations/
│   │   │   └── index.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── vercel.json            # Configuração do Vercel
├── .gitignore
└── README.md
Como Executar Localmente
Pré-requisitos
Node.js 18+ e npm

Python 3.11+ e pip

PostgreSQL (opcional, SQLite funciona para desenvolvimento)

1. Clonar o repositório
bash
git clone https://github.com/FelipeFreitasRossi/React.git
cd React
2. Configurar o Backend
bash
cd backend
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows
pip install -r requirements.txt
Crie um arquivo .env na pasta backend (copie de .env.example):

env
DATABASE_URL=sqlite:///findash.db   # ou postgresql://...
SECRET_KEY=sua-chave-secreta-aqui
Execute o servidor:

bash
python app.py
O backend estará em http://localhost:5000 e o WebSocket em ws://localhost:8765.

3. Configurar o Frontend
Em outro terminal:

bash
cd frontend
npm install
Crie um arquivo .env na pasta frontend:

env
REACT_APP_API_URL=http://localhost:5000
Execute o servidor de desenvolvimento:

bash
npm start
O frontend estará em http://localhost:3000.

4. Acessar a aplicação
Abra http://localhost:3000 no navegador. Faça cadastro e login para acessar o dashboard.

Deploy
Backend (Render)
Crie uma conta no Render.

Conecte o repositório GitHub.

Crie um Web Service com as seguintes configurações:

Build Command: pip install -r requirements.txt

Start Command: gunicorn app:app

Environment Variables:

DATABASE_URL (PostgreSQL do Render)

SECRET_KEY

PYTHON_VERSION (opcional)

Crie um banco de dados PostgreSQL no Render e obtenha a URL.

O Render fará o deploy automaticamente a cada push.

Frontend (Vercel)
Crie uma conta no Vercel.

Conecte o repositório GitHub.

Configure:

Build Command: npm run build

Output Directory: build

Environment Variables:

REACT_APP_API_URL: URL do backend no Render

DISABLE_ESLINT_PLUGIN: true (para ignorar warnings)

O Vercel fará o deploy automaticamente a cada push.

API Endpoints
Autenticação
Método	Endpoint	Descrição
POST	/api/register	Cadastrar novo usuário
POST	/api/login	Login e retorno de token JWT
GET	/api/me	Validar token e obter dados do usuário
Perfil e Segurança
Método	Endpoint	Descrição
PUT	/api/update-profile	Atualizar nome de usuário e nome completo
POST	/api/change-password	Alterar senha
DELETE	/api/delete-account	Excluir conta permanentemente
Dados Financeiros
Método	Endpoint	Descrição
GET	/api/historical	Dados históricos de um ativo (AAPL, TSLA)
GET	/api/company-info	Informações da empresa (nome, setor)
GET	/api/crypto-prices	Preços de criptomoedas e moedas
WebSocket
Endpoint	Descrição
ws://localhost:8765	Conexão WebSocket para preços em tempo real
Contribuição
Contribuições são bem-vindas! Siga os passos:

Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/nova-feature)

Commit suas mudanças (git commit -m 'Adiciona nova feature')

Push para a branch (git push origin feature/nova-feature)

Abra um Pull Request

Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

Contato
Autor: Felipe de Freitas Rossi

GitHub: FelipeFreitasRossi

LinkedIn: Felipe de Freitas Rossi
