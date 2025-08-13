require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import sequelize from './sequelize';
import { ExpressRouter } from './configs/router';
import path from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);

const corsOptions = {
  origin: process.env.FRONT_END_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};

const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});

// Middlewares
app.use(cors(corsOptions));
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).io = io;
  next();
});
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
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rotas
const router = new ExpressRouter();
router.instanceRoutes(app);

// Lógica de Conexão do Socket.IO
io.on('connection', socket => {
  // Evento para um cliente entrar em uma sala de projeto
  socket.on('joinProjectRoom', projectId => {
    socket.join(projectId);
  });

  socket.on('joinUserRoom', userId => {
    socket.join(userId);
  });
});

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
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
