import path from 'path';
import { ResponseI } from '../interfaces/response.interface';
import { Attachment } from '../models/attachment.model';
import { Task, TaskI } from '../models/task.models';
import * as fs from 'fs';
import { User } from '../models/user.model';
import { TaskStatus, TaskStatusEnum } from '../enums/status.enum';
import { Comment, CommentI } from '../models/comment.model';
import { Tag } from '../models/tag.model';
import TaskTag from '../models/task_tag.model';
import { Version } from '../models/version.model';
import { Project } from '../models/project.model';
import { deleteFile, uploadFile } from '../utils/files.utils';
import { TaskHistory } from '../models/task_history.model';
import { clone } from '../utils/utils';

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

  public static async update(task: TaskI, userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!task || !task.id) {
        response = {
          message: 'Tarefa inválida, verifique os dados.',
          success: false,
        };
        return response;
      }

      const taskExists = await Task.findOne({ where: { id: task.id } });
      if (!taskExists) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      const oldTask = taskExists.get({ plain: true });

      const changes: { field: string; oldValue: any; newValue: any }[] = [];

      if (task.title !== undefined && task.title !== oldTask.title) {
        changes.push({ field: 'title', oldValue: oldTask.title, newValue: task.title });
      }
      if (task.description !== undefined && task.description !== oldTask.description) {
        changes.push({ field: 'description', oldValue: oldTask.description, newValue: task.description });
      }
      if (task.assigneeId !== undefined && task.assigneeId !== oldTask.assigneeId) {
        changes.push({ field: 'assigneeId', oldValue: oldTask.assigneeId, newValue: task.assigneeId });
      }
      if (task.priority !== undefined && task.priority !== oldTask.priority) {
        changes.push({ field: 'priority', oldValue: oldTask.priority, newValue: task.priority });
      }
      if (task.status !== undefined && task.status !== oldTask.status) {
        changes.push({ field: 'status', oldValue: oldTask.status, newValue: task.status });
      }
      if (task.deadline !== undefined && new Date(task.deadline).getTime() !== new Date(oldTask.deadline!).getTime()) {
        changes.push({ field: 'deadline', oldValue: oldTask.deadline, newValue: task.deadline });
      }
      if (task.versionId !== undefined && task.versionId !== oldTask.versionId) {
        changes.push({ field: 'versionId', oldValue: oldTask.versionId, newValue: task.versionId });
      }
      if (task.blockReason !== undefined && task.blockReason !== oldTask.blockReason) {
        changes.push({ field: 'blockReason', oldValue: oldTask.blockReason, newValue: task.blockReason });
      }

      const [rowsAffected, [updatedTask]] = await Task.update(
        {
          versionId: task.versionId,
          assigneeId: task.assigneeId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          deadline: task.deadline,
          blockReason: task.blockReason,
        },
        { where: { id: task.id }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhuma tarefa foi atualizada.',
          success: false,
        };
        return response;
      }

      for (const change of changes) {
        await this.addHistory(task.id, change.field, userId, change.oldValue, change.newValue);
      }

      response = {
        message: 'Tarefa atualizada com sucesso.',
        success: true,
        data: updatedTask,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async delete(taskId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!taskId) {
        response = {
          message: 'Id da tarefa não informado.',
          success: false,
        };
        return response;
      }

      const taskExists = await Task.findOne({ where: { id: taskId } });
      if (!taskExists) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      const deletedRows = await Task.destroy({
        where: { id: taskId },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhuma tarefa foi removida.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tarefa removida com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover tarefa, consulte o Log.',
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

      const fileUrl = await uploadFile(file);

      const newAttachment = await Attachment.create({
        taskId: taskId,
        fileName: file.originalname,
        url: fileUrl,
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

  public static async removeFile(attachmentId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!attachmentId) {
        response = {
          message: 'Id do anexo não informado!',
          success: false,
        };
        return response;
      }

      const attachment = await Attachment.findByPk(attachmentId);
      if (!attachment) {
        response = {
          message: 'Anexo não encontrado.',
          success: false,
        };
        return response;
      }

      const tryDeleteFile = await deleteFile(attachment.url);

      if (!tryDeleteFile) {
        response = {
          message: 'Erro ao remover arquivo do sistema de arquivos.',
          success: false,
        };
        return response;
      }

      const deletedRows = await Attachment.destroy({
        where: { id: attachmentId },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhum anexo foi removido.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Anexo removido com sucesso!',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover anexo, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getAttachments(taskId: number): Promise<ResponseI> {
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

      const attachments: Attachment[] = await Attachment.findAll({
        where: { taskId: taskId },
      });

      if (!attachments) {
        response = {
          message: 'Nenhum anexo encontrado para esta tarefa.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Anexos encontrados com sucesso.',
        success: true,
        data: attachments,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar anexos da tarefa, consulte o Log.',
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

  public static async removeTag(taskId: number, tagId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!taskId || !tagId) {
        response = {
          message: 'Dados incompletos para remover a tag da tarefa.',
          success: false,
        };
        return response;
      }

      const taskTagExists = await TaskTag.findOne({ where: { taskId, tagId } });
      if (!taskTagExists) {
        response = {
          message: 'Esta tag não está associada a esta tarefa.',
          success: false,
        };
        return response;
      }

      const deletedRows = await TaskTag.destroy({
        where: { id: taskTagExists.id },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhuma tag foi removida da tarefa.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tag removida da tarefa com sucesso!',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover tag da tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getTaskTags(taskId: number): Promise<ResponseI> {
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

      const taskTags: TaskTag[] = await TaskTag.findAll({
        where: { taskId: taskId },
        include: [
          {
            model: Tag,
            attributes: ['id', 'name', 'color'],
          },
        ],
      });

      if (!taskTags) {
        response = {
          message: 'Nenhuma tag encontrada para esta tarefa.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tags da tarefa encontradas com sucesso.',
        success: true,
        data: taskTags,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar tags da tarefa, consulte o Log.',
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

      const task: TaskI | null = clone(
        await Task.findOne({
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
              model: TaskTag,
              include: [
                {
                  model: Tag,
                  attributes: ['id', 'name', 'color'],
                },
              ],
              separate: true, // Otimiza a consulta de tags
            },
            {
              model: Version,
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: Project,
                  attributes: ['id', 'name', 'description'],
                },
              ],
            },
          ],
        })
      );

      if (!task) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      // Busca os comentários separadamente e com ordenação
      const comments = await Comment.findAll({
        where: { taskId: taskId },
        include: [
          {
            model: User,
            attributes: ['id', 'fullName', 'username', 'image'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      task.comments = comments;

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

  public static async getAll(versionId: number, userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (versionId) {
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
            {
              model: TaskTag,
              include: [
                {
                  model: Tag,
                  attributes: ['id', 'name', 'color'],
                },
              ],
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
      } else {
        const tasks: TaskI[] = await Task.findAll({
          where: { assigneeId: userId },
          include: [
            {
              model: Attachment,
            },
            {
              model: User,
              attributes: ['id', 'fullName', 'username', 'image'],
            },
            {
              model: TaskTag,
              include: [
                {
                  model: Tag,
                  attributes: ['id', 'name', 'color'],
                },
              ],
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
      }

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

  public static async updateStatus(taskId: number, newStatus: TaskStatusEnum, userId: number): Promise<ResponseI> {
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

      const oldStatus = TaskStatus.find(status => status.id === taskExists.status)?.name;

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

      const newStatuText = TaskStatus.find(status => status.id === newStatus)?.name;

      await this.addHistory(taskId, 'status', userId, oldStatus, newStatuText);

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

  public static async addHistory(
    taskId: number,
    field: string,
    changedBy: number,
    oldValue?: any,
    newValue?: any
  ): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!taskId || !field || !changedBy) {
        response = {
          message: 'Dados incompletos para adicionar histórico da tarefa.',
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

      const newHistory = await TaskHistory.create({
        taskId: taskId,
        field: field,
        oldValue: oldValue !== undefined && oldValue !== null ? String(oldValue) : undefined,
        newValue: newValue !== undefined && newValue !== null ? String(newValue) : undefined,
        changedAt: new Date(),
        changedBy: changedBy,
      });

      if (!newHistory) {
        response = {
          message: 'Erro ao adicionar histórico da tarefa, consulte o Log.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Histórico da tarefa adicionado com sucesso!',
        success: true,
        data: newHistory,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao adicionar histórico da tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getHistory(taskId: number): Promise<ResponseI> {
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

      const history: TaskHistory[] = await TaskHistory.findAll({
        where: { taskId: taskId },
        include: [
          {
            model: User,
            attributes: ['id', 'fullName', 'username', 'image'],
          },
        ],
        order: [['changedAt', 'DESC']],
      });

      if (!history) {
        response = {
          message: 'Nenhum histórico encontrado para esta tarefa.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Histórico da tarefa encontrado com sucesso.',
        success: true,
        data: history,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar histórico da tarefa, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
