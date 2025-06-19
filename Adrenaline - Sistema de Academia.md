# Adrenaline - Sua Dose de Força

Um sistema completo de gerenciamento de academia desenvolvido com tecnologias modernas, oferecendo funcionalidades específicas para administradores, personal trainers e usuários.

## 🏋️ Características Principais

- **Design Moderno**: Interface responsiva com tema vermelho e preto
- **Três Tipos de Usuário**: Administrador, Personal Trainer e Usuário
- **Gestão Completa**: Usuários, funcionários, planos de treino e agendamentos
- **Segurança**: Autenticação JWT e criptografia de senhas
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express.js
- MySQL
- JWT para autenticação
- bcryptjs para criptografia
- CORS habilitado

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Design responsivo com CSS Grid e Flexbox
- Font Awesome para ícones
- Google Fonts (Poppins)

## 📁 Estrutura do Projeto

```
Adrenaline/
├── backend/
│   ├── server.js          # Servidor principal
│   ├── package.json       # Dependências do Node.js
│   ├── .env              # Configurações de ambiente
│   └── node_modules/     # Dependências instaladas
├── frontend/
│   ├── index.html        # Página inicial
│   ├── admin-dashboard.html    # Dashboard do administrador
│   ├── personal-dashboard.html # Dashboard do personal trainer
│   ├── user-dashboard.html     # Dashboard do usuário
│   ├── styles.css        # Estilos principais
│   ├── dashboard.css     # Estilos dos dashboards
│   ├── script.js         # JavaScript principal
│   └── admin-dashboard.js      # JavaScript do admin
├── docs/
│   ├── documentacao-completa.md  # Documentação em Markdown
│   └── documentacao-completa.pdf # Documentação em PDF
├── schema.sql            # Script de criação do banco
└── README.md            # Este arquivo
```

## 🚀 Instalação Rápida

### 1. Pré-requisitos
- Node.js 14+ instalado
- MySQL 5.7+ instalado
- Navegador web moderno

### 2. Configurar Banco de Dados
```bash
# Acessar MySQL
mysql -u root -p

# Executar script de criação
source schema.sql

# Criar usuário para a aplicação
CREATE USER 'johnnys_user'@'localhost' IDENTIFIED BY 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON johnnys_strong.* TO 'johnnys_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurar Backend
```bash
# Navegar para o diretório backend
cd backend

# Instalar dependências
npm install

# Configurar arquivo .env (editar com suas credenciais)
# DB_HOST=localhost
# DB_USER=johnnys_user
# DB_PASSWORD=sua_senha_aqui
# DB_NAME=johnnys_strong
# PORT=3000
# JWT_SECRET=sua_chave_secreta_jwt

# Iniciar servidor
npm start
```

### 4. Acessar Sistema
- Abra `frontend/index.html` no navegador
- O backend estará rodando em `http://localhost:3000`

## 👥 Tipos de Usuário

### 🔧 Administrador
- Gerenciamento completo de usuários
- Gestão de funcionários
- Visualização de relatórios
- Configurações do sistema

### 💪 Personal Trainer
- Gerenciamento de clientes
- Criação de planos de treino
- Registro de progresso
- Agendamento de sessões

### 🏃 Usuário (Aluno)
- Visualização de treinos
- Agendamento de sessões
- Acompanhamento de progresso
- Gerenciamento de perfil

## 📖 Documentação

A documentação completa está disponível em:
- **Markdown**: `docs/documentacao-completa.md`
- **PDF**: `docs/documentacao-completa.pdf`

A documentação inclui:
- Guia de instalação detalhado
- Manual de cada tipo de usuário
- Documentação da API
- Solução de problemas
- Considerações de segurança

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT com tokens seguros
- Validação de dados no frontend e backend
- Proteção contra ataques comuns

## 🌐 API REST

A API oferece endpoints para:
- Autenticação (`/api/login`, `/api/register`)
- Gestão de usuários (`/api/admin/users`)
- Planos de treino (`/api/personal/training-plans`)
- Agendamentos (`/api/user/sessions`)

## 🎨 Design

- **Cores principais**: Vermelho (#CC0000) e Preto (#000000)
- **Tipografia**: Poppins (Google Fonts)
- **Ícones**: Font Awesome 6.0
- **Layout**: Responsivo com CSS Grid e Flexbox

## 🔧 Desenvolvimento

### Executar em modo desenvolvimento
```bash
cd backend
npm run dev  # Se disponível, usa nodemon para auto-reload
```

### Estrutura da API
- Todas as rotas começam com `/api`
- Autenticação via Bearer Token
- Respostas em JSON
- Códigos HTTP padrão

## 📱 Compatibilidade

### Navegadores Suportados
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Opera 60+

### Dispositivos
- Desktop (Windows, macOS, Linux)
- Tablets (iOS, Android)
- Smartphones (iOS, Android)

## 🤝 Suporte

Para dúvidas sobre instalação ou uso:
1. Consulte a documentação completa em `docs/`
2. Verifique a seção "Solução de Problemas"
3. Revise os logs do servidor para erros específicos

## 📄 Licença

Este projeto foi desenvolvido como sistema personalizado para academias.

---

**Desenvolvido por Manus AI**  
**Versão**: 1.0.0  
**Data**: Junho 2024
