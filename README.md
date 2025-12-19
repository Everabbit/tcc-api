# API - TaskForge

## 📌 Sobre

Esta é a API do projeto de gerenciamento de projetos do TCC TaskForge. Ela fornece endpoints para cadastro, edição e visualização de projetos, autenticação e notificações.

## 🚀 Tecnologias

- Node.js
- Express
- PostgreSQL
- TypeScript

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (v16 ou superior)
- [PostgreSQL](https://www.postgresql.org/)
- Gerenciador de pacotes (NPM ou Yarn)

## 🔧 Instalação e Configuração

### 1. Instale as dependências

Navegue até a pasta da API e instale as dependências do projeto:

```bash
cd api
npm install
```

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `api`. Defina as variáveis necessárias para conexão com o banco de dados e configurações gerais:

```env
PORT=3333
DATABASE_URL=postgresql://usuario:senha@localhost:5432/taskforge
JWT_SECRET=sua_chave_secreta_segura
```

### 3. Executando a Aplicação

Para rodar o servidor em modo de desenvolvimento (com hot-reload):

```bash
npm run dev
```

Para gerar o build de produção e executar:

```bash
npm run build
npm start
```
