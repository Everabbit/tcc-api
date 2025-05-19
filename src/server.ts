require('dotenv').config();
import express from 'express';
import cors from 'cors';
import sequelize from './sequelize';
import { ExpressRouter } from './configs/router';

const app = express();
const router = new ExpressRouter();

// Middlewares
app.use(cors());
app.use(express.json()); // Para interpretar JSON no corpo das requisições

// Rotas
router.instanceRoutes(app);

// Testa a conexão com o banco
sequelize
  .authenticate()
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso!'))
  .catch(err => console.error('Erro ao conectar com o banco:', err));

sequelize
  .sync({ force: false }) // force: true recria tabelas a cada execução
  .then(() => console.log('Tabelas sincronizadas com sucesso!'))
  .catch(err => console.error('Erro ao sincronizar tabelas:', err));

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
