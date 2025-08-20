import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import { Project } from './models/project.model';
import { ProjectParticipation } from './models/project_participation.model';
import { UserPreferences } from './models/user_preferences.model';
import { Version } from './models/version.model';
import { Task } from './models/task.models';
import { Tag } from './models/tag.model';
import { GitHubLink } from './models/github_link.model';
import { Commit } from './models/commit.model';
import { Attachment } from './models/attachment.model';
import { Comment } from './models/comment.model';
import TaskTag from './models/task_tag.model';
import { EmailRequest } from './models/email_request.model';
import { ChangePasswordRequest } from './models/change_password_request.model';
import { EmailChangeRequest } from './models/email_change_request.model';

const sequelize = new Sequelize({
  database: process.env.DATABASE,
  schema: process.env.DATABASE_SCHEMA,
  dialect: process.env.DATABASE_DIALECT as any,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  models: [
    User,
    Project,
    ProjectParticipation,
    UserPreferences,
    Version,
    Task,
    Tag,
    GitHubLink,
    Commit,
    Comment,
    Attachment,
    TaskTag,
    EmailRequest,
    ChangePasswordRequest,
    EmailChangeRequest,
  ], // ARQUIVOS DE MODEL
  logging: false, // Opcional: desativa logs de SQL no console
});

export default sequelize;
