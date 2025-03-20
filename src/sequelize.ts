import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import { Project } from './models/projects.model';
import { UserProject } from './models/users_projects.model';

const sequelize = new Sequelize({
  database: process.env.DATABASE,
  schema: process.env.DATABASE_SCHEMA,
  dialect: process.env.DATABASE_DIALECT as any,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  models: [User, Project, UserProject], // ARQUIVOS DE MODEL
  logging: false, // Opcional: desativa logs de SQL no console
});

export default sequelize;
