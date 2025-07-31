import path from 'path';
import { ResponseI } from '../interfaces/response.interface';
import { Attachment } from '../models/attachment.model';
import { Task, TaskI } from '../models/task.models';
import * as fs from 'fs';
import { User } from '../models/user.model';
import { TaskStatusEnum } from '../enums/status.enum';
import { Comment } from '../models/comment.model';
import { Tag } from '../models/tag.model';
import TaskTag from '../models/task_tag.model';

export default class TaskService {
  public static async create(task: TaskI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      if (!task || !task.title || !task.versionId) {
        response = {
          message: 'Tarefa inválida, verifique os dados.',
          success: false,
        };
        return response;
      }

      const newTask = await Task.create({
        versionId: task.versionId,
        assigneeId: task.assigneeId,
        parentTaskId: task.parentTaskId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline,
        blockReason: task.blockReason,
      });
      if (!newTask) {
        response = {
          message: 'Erro ao criar tarefa, consulte o Log.',
          success: false,
        };
        return response;
      }
      response = {
        message: 'Tarefa criada com sucesso.',
        success: true,
        data: newTask,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao criar tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async uploadFile(taskId: number, file: Express.Multer.File): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!taskId || !file) {
        response = {
          message: !taskId ? 'Id da tarefa não informado!' : 'Nenhum arquivo enviado!',
          success: false,
        };
        return response;
      }

      const taskExists = await Task.findByPk(taskId);
      if (!taskExists) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      const newAttachment = await Attachment.create({
        taskId: taskId,
        fileName: file.originalname,
        url: filePath,
        type: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      });

      if (!newAttachment) {
        response = {
          message: 'Erro ao salvar informações do anexo no banco de dados.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Arquivo anexado com sucesso!',
        success: true,
        data: newAttachment,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao anexar arquivo, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async saveTag(taskId: number, tagId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!taskId || !tagId) {
        response = {
          message: 'Dados incompletos para salvar a tag na tarefa.',
          success: false,
        };
        return response;
      }

      const taskExists = await Task.findByPk(taskId);
      if (!taskExists) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      const tagExists = await Tag.findByPk(tagId);
      if (!tagExists) {
        response = {
          message: 'Tag não encontrada.',
          success: false,
        };
        return response;
      }

      const taskTagExists = await TaskTag.findOne({ where: { taskId, tagId } });
      if (taskTagExists) {
        response = {
          message: 'Esta tag já está associada a esta tarefa.',
          success: false,
        };
        return response;
      }

      const newTaskTag = await TaskTag.create({
        taskId,
        tagId,
      });

      if (!newTaskTag) {
        response = {
          message: 'Erro ao associar tag à tarefa, consulte o Log.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tag associada à tarefa com sucesso!',
        success: true,
        data: newTaskTag,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao associar tag à tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getAll(versionId: number, userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!versionId) {
        response = {
          message: 'Id da versão não informado!',
          success: false,
        };
        return response;
      }

      const tasks: TaskI[] = await Task.findAll({
        where: { versionId: versionId },
        include: [
          {
            model: Attachment,
          },
          {
            model: User,
            attributes: ['id', 'fullName', 'username', 'image'],
          },
        ],
      });

      if (!tasks) {
        response = {
          message: 'Nenhuma tarefa encontrada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tarefas encontradas com sucesso.',
        success: true,
        data: tasks,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar tarefas, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async updateStatus(taskId: number, newStatus: TaskStatusEnum): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!taskId || !newStatus) {
        response = {
          message: 'Dados incompletos para atualizar o status da tarefa.',
          success: false,
        };
        return response;
      }

      const taskExists = await Task.findByPk(taskId);
      if (!taskExists) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      const [rowsAffected, [updatedTask]] = await Task.update(
        {
          status: newStatus,
        },
        { where: { id: taskId }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhuma tarefa foi atualizada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Status da tarefa atualizado com sucesso.',
        success: true,
        data: updatedTask,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar status da tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async get(taskId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!taskId) {
        response = {
          message: 'Id da tarefa não informado!',
          success: false,
        };
        return response;
      }

      const task: TaskI | null = await Task.findOne({
        where: { id: taskId },
        include: [
          {
            model: Attachment,
          },
          {
            model: User,
            attributes: ['id', 'fullName', 'username', 'image'],
          },
          {
            model: Comment,
          },
        ],
      });

      if (!task) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tarefa encontrada com sucesso.',
        success: true,
        data: task,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
