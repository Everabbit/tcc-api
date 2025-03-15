import { Router } from 'express';

const routes = Router();

// Rota inicial
routes.get('/', (req, res) => {
  res.send('API está funcionando!');
});

export default routes;