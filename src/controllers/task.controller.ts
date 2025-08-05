import { Request, Response } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import { TaskI } from '../models/task.models';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import TaskService from '../services/task.service';
import { TaskStatusEnum } from '../enums/status.enum';

export default class TaskController {
  public async createTask(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const task: TaskI = JSON.parse(req.body.task);
      const attachments = req.files as Express.Multer.File[];

      if (!task) {
        response = {
          message: 'Dados da tarefa não informados!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const newTask: TaskI = {
        versionId: task.versionId,
        assigneeId: task.assigneeId,
        parentTaskId: task.parentTaskId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        blockReason: task.blockReason,
      };

      const taskCreated: ResponseI = await TaskService.create(newTask);

      if (!taskCreated.success) {
        response = {
          message: taskCreated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      if (task.tags && task.tags.length > 0) {
        for (const tag of task.tags) {
          const tagSaved: ResponseI = await TaskService.saveTag(taskCreated.data.id, tag.tagId);
          if (!tagSaved.success) {
            response = {
              message: `Falha ao associar tag ${tag.tag?.name}: ${tagSaved.message}`,
              success: false,
            };
            return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
          }
        }
      }

      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          const attachmentUploaded: ResponseI = await TaskService.uploadFile(taskCreated.data.id, attachment);
          if (!attachmentUploaded.success) {
            response = {
              message: `Falha ao fazer upload do anexo ${attachment.originalname}: ${attachmentUploaded.message}`,
              success: false,
            };
            return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
          }
        }
      }

      response = {
        message: 'Tarefa criada com sucesso!',
        success: true,
        data: taskCreated.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async updateTask(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const taskId: number = parseInt(req.params.taskId);
      const task: TaskI = JSON.parse(req.body.task);
      const attachments = req.files as Express.Multer.File[];

      if (!taskId) {
        response = {
          message: 'Id da tarefa não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const updatedTask: TaskI = {
        id: taskId,
        versionId: task.versionId,
        assigneeId: task.assigneeId,
        parentTaskId: task.parentTaskId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        blockReason: task.blockReason,
      };

      const taskUpdated: ResponseI = await TaskService.update(updatedTask);

      if (!taskUpdated.success) {
        response = {
          message: taskUpdated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      // if (task.tags && task.tags.length > 0) {
      //   for (const tag of task.tags) {
      //     const tagSaved: ResponseI = await TaskService.saveTag(taskUpdated.data.id, tag.tagId);
      //     if (!tagSaved.success) {
      //       response = {
      //         message: `Falha ao associar tag ${tag.tag?.name}: ${tagSaved.message}`,
      //         success: false,
      //       };
      //       return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      //     }
      //   }
      // }

      // buscar tags, verificar as que já estão cadastradas e não fazer nada, as que estão cadastradas e não estão mais devem ser removidas, e as que estão no item alterado e não estão cadastradas precisam ser cadastradas

      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          const attachmentUploaded: ResponseI = await TaskService.uploadFile(taskUpdated.data.id, attachment);
          if (!attachmentUploaded.success) {
            response = {
              message: `Falha ao fazer upload do anexo ${attachment.originalname}: ${attachmentUploaded.message}`,
              success: false,
            };
            return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
          }
        }
      }

      response = {
        message: 'Tarefa atualizada com sucesso!',
        success: true,
        data: taskUpdated.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getAllTasks(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const versionId: number = parseInt(req.params.versionId);
      const userId: number = parseInt(req.params.userId);

      if (!versionId) {
        response = {
          message: 'Id da versão não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const tasks: ResponseI = await TaskService.getAll(versionId, userId);

      if (!tasks.success) {
        response = {
          message: tasks.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Tarefas encontradas!',
        success: true,
        data: tasks.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async updateStatusTask(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const taskId: number = parseInt(req.params.taskId);
      const newStatus: TaskStatusEnum = req.body.status;

      if (!taskId || !newStatus) {
        response = {
          message: 'Dados incompletos para atualizar o status da tarefa.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const taskUpdated: ResponseI = await TaskService.updateStatus(taskId, newStatus);

      if (!taskUpdated.success) {
        response = {
          message: taskUpdated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Status da tarefa atualizado com sucesso!',
        success: true,
        data: taskUpdated.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getTask(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const taskId: number = parseInt(req.params.taskId);

      if (!taskId) {
        response = {
          message: 'Id da tarefa não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const task: ResponseI = await TaskService.get(taskId);

      if (!task.success) {
        response = {
          message: task.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Tarefa encontrada!',
        success: true,
        data: task.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
