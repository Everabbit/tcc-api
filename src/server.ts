require('dotenv').config();
import express from 'express';
import cors from 'cors';
import sequelize from './sequelize';
import { ExpressRouter } from './configs/router';

const app = express();
const router = new ExpressRouter();

// Middlewares
app.use(cors());
app.use((req, res, next) => {
  const contentType = req.headers['content-type'];

  if (contentType?.includes('application/json')) {
    express.json()(req, res, next);
  } else if (contentType?.includes('application/x-www-form-urlencoded')) {
    express.urlencoded({ extended: true })(req, res, next);
  } else {
    next();
  }
});

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
