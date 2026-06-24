FinDash
Plataforma inteligente para monitoramento de investimentos com dados em tempo real.

https://img.shields.io/badge/Deploy-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white
https://img.shields.io/badge/Deploy-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white
https://img.shields.io/badge/Repo-GitHub-181717?style=for-the-badge&logo=github&logoColor=white
https://img.shields.io/badge/License-MIT-blue?style=for-the-badge

Visão Geral
FinDash é uma aplicação full‑stack construída para auxiliar investidores no acompanhamento de ativos financeiros. Com uma interface moderna, gráficos interativos e atualizações em tempo real, a ferramenta oferece uma experiência fluida tanto para iniciantes quanto para analistas experientes.

Funcionalidades
Autenticação segura – Registro e login com JWT + bcrypt.

Dashboard dinâmico – Gráficos de preços com médias móveis (SMA 7/21) e indicadores rápidos.

Dados ao vivo – Cotações de ações e criptomoedas via WebSocket (atualização a cada 2s).

Perfil do usuário – Edição de nome, foto e informações pessoais.

Configurações globais – Alternância entre tema claro/escuro e idiomas (PT / EN).

Responsividade total – Adaptação a qualquer tamanho de tela.

Segurança de ponta – Tokens JWT, hashing de senhas com bcrypt e proteção de rotas.

Stack Tecnológica
Frontend
React 18, React Router DOM, Styled Components

Recharts, React Icons, Socket.io‑client

Backend
Flask 2.3.3, Flask‑SQLAlchemy, Flask‑CORS

PyJWT, Bcrypt, yfinance, WebSockets, Gunicorn

Banco de Dados
PostgreSQL (produção) / SQLite (desenvolvimento)

Infraestrutura
Vercel (frontend) · Render (backend + DB) · Git

Arquitetura
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │      │  Backend    │      │  Database   │
│   (React)   │◄────►│   (Flask)   │◄────►│ (PostgreSQL)│
│   Vercel    │      │   Render    │      │   Render    │
└─────────────┘      └─────────────┘      └─────────────┘
        │                    │
        └────── WebSocket ───┘
O frontend consome a API REST para operações CRUD e autenticação.

O WebSocket mantém uma conexão persistente para transmissão de preços em tempo real.

O backend consulta a API do Yahoo Finance e aplica cache para otimizar requisições.

Estrutura do Projeto
FinDash/
├── backend/
│   ├── app.py                 # Ponto de entrada do Flask
│   ├── requirements.txt       # Dependências Python
│   └── .env.example           # Variáveis de ambiente (modelo)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── contexts/          # Contextos (tema, idioma)
│   │   ├── translations/      # Arquivos de tradução
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── vercel.json
├── .gitignore
└── README.md
Como Executar Localmente
Pré‑requisitos
Node.js ≥ 18

Python ≥ 3.11

PostgreSQL (opcional – SQLite funciona para testes)

1. Clone o repositório
git clone https://github.com/FelipeFreitasRossi/React.git
cd React
2. Backend
cd backend
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows
pip install -r requirements.txt
Crie um arquivo .env na pasta backend com:

env
DATABASE_URL=sqlite:///findash.db
SECRET_KEY=your_super_secret_key
Inicie o servidor:

python app.py
O backend estará em http://localhost:5000 e o WebSocket em ws://localhost:8765.

3. Frontend
cd frontend
npm install
Crie um arquivo .env na pasta frontend:

env
REACT_APP_API_URL=http://localhost:5000
Rode o servidor de desenvolvimento:

npm start
Acesse http://localhost:3000.

Deploy
Backend – Render
Crie um Web Service no Render conectado ao seu repositório.

Defina:

Build Command: pip install -r requirements.txt

Start Command: gunicorn app:app

Environment Variables: DATABASE_URL (PostgreSQL), SECRET_KEY

O Render executa o deploy automaticamente a cada push.

Frontend – Vercel
Importe o projeto no Vercel.

Configure:

Build Command: npm run build

Output Directory: build

Environment Variables:

REACT_APP_API_URL (URL do backend no Render)

DISABLE_ESLINT_PLUGIN = true

A Vercel atualiza o deploy a cada push.

API Endpoints
Autenticação
Método	Rota	Descrição
POST	/api/register	Cadastro de novo usuário
POST	/api/login	Login e retorno do token JWT
GET	/api/me	Valida token e retorna dados do usuário
Perfil e Segurança
Método	Rota	Descrição
PUT	/api/update-profile	Atualiza nome de usuário e nome completo
POST	/api/change-password	Altera a senha
DELETE	/api/delete-account	Exclui a conta permanentemente
Dados Financeiros
Método	Rota	Descrição
GET	/api/historical	Dados históricos (AAPL, TSLA, etc.)
GET	/api/company-info	Informações da empresa
GET	/api/crypto-prices	Preços de criptomoedas e moedas
WebSocket
Endpoint	Descrição
ws://localhost:8765	Atualizações de preços em tempo real
Contribuição
Sinta‑se à vontade para contribuir com melhorias, correções ou novas funcionalidades.

Fork o projeto.

Crie uma branch para sua feature:

git checkout -b feature/minha-feature
Commit suas alterações:

git commit -m "Adiciona minha feature"
Push para a branch:

git push origin feature/minha-feature
Abra um Pull Request.

Licença
Este projeto está licenciado sob a MIT License – veja o arquivo LICENSE para detalhes.

Contato
Felipe de Freitas Rossi
GitHub: @FelipeFreitasRossi
LinkedIn: Felipe de Freitas Rossi
