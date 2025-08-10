import { Request, Response } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import { TaskI } from '../models/task.models';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import TaskService from '../services/task.service';
import { TaskStatusEnum } from '../enums/status.enum';
import { AttachmentI } from '../models/attachment.model';
import { CommentI } from '../models/comment.model';

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

      if (task.comments && task.comments.length > 0) {
        for (const comment of task.comments) {
          const commentAdded: ResponseI = await TaskService.addComment({
            taskId: taskCreated.data.id,
            authorId: comment.authorId,
            content: comment.content,
            edited: comment.edited,
          });
          if (!commentAdded.success) {
            response = {
              message: `Falha ao adicionar comentário: ${commentAdded.message}`,
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

      const currentTagsResponse: ResponseI = await TaskService.getTaskTags(taskId);
      if (!currentTagsResponse.success) {
        response = {
          message: `Falha ao buscar tags existentes: ${currentTagsResponse.message}`,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      const currentTagIds: number[] = currentTagsResponse.data.map((tag: any) => tag.tagId);
      const newTagIds: number[] = task.tags ? task.tags.map(tag => tag.tagId) : [];

      for (const tagId of currentTagIds) {
        if (!newTagIds.includes(tagId)) {
          const tagRemoved: ResponseI = await TaskService.removeTag(taskId, tagId);
          if (!tagRemoved.success) {
            response = {
              message: `Falha ao remover tag ${tagId}: ${tagRemoved.message}`,
              success: false,
            };
            return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
          }
        }
      }

      if (task.tags) {
        for (const tag of task.tags) {
          if (!currentTagIds.includes(tag.tagId)) {
            const tagSaved: ResponseI = await TaskService.saveTag(taskId, tag.tagId);
            if (!tagSaved.success) {
              response = {
                message: `Falha ao associar tag ${tag.tag?.name}: ${tagSaved.message}`,
                success: false,
              };
              return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
            }
          }
        }
      }

      const currentAttachmentsResponse: ResponseI = await TaskService.getAttachments(taskId);
      if (!currentAttachmentsResponse.success) {
        response = {
          message: `Falha ao buscar anexos existentes: ${currentAttachmentsResponse.message}`,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      const currentAttachmentIds: AttachmentI[] = currentAttachmentsResponse.data;

      for (const currentAttachment of currentAttachmentIds) {
        const isStillPresent = task.attachments?.some((newAtt: any) => newAtt.id === currentAttachment.id) || false;
        if (!isStillPresent) {
          const attachmentRemoved: ResponseI = await TaskService.removeFile(currentAttachment.id!);
          if (!attachmentRemoved.success) {
            response = {
              message: `Falha ao remover anexo: ${attachmentRemoved.message}`,
              success: false,
            };
            return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
          }
        }
      }

      const newAttachmentFiles: Express.Multer.File[] = attachments || [];

      for (const newAttachment of newAttachmentFiles) {
        const attachmentUploaded: ResponseI = await TaskService.uploadFile(taskId, newAttachment);
        if (!attachmentUploaded.success) {
          response = {
            message: `Falha ao fazer upload do anexo ${newAttachment.originalname}: ${attachmentUploaded.message}`,
            success: false,
          };
          return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
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

  public async deleteTask(req: Request, res: Response) {
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

      const taskDeleted: ResponseI = await TaskService.delete(taskId);

      if (!taskDeleted.success) {
        response = {
          message: taskDeleted.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Tarefa removida com sucesso!',
        success: true,
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

  public async addComment(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const comment: CommentI = req.body;

      if (!comment || !comment.taskId || !comment.authorId || !comment.content) {
        response = {
          message: 'Dados incompletos para adicionar comentário.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const commentAdded: ResponseI = await TaskService.addComment(comment);

      if (!commentAdded.success) {
        response = {
          message: commentAdded.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Comentário adicionado com sucesso!',
        success: true,
        data: commentAdded.data,
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

  public async removeComment(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const commentId: number = parseInt(req.params.commentId);

      if (!commentId) {
        response = {
          message: 'Id do comentário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const commentRemoved: ResponseI = await TaskService.removeComment(commentId);

      if (!commentRemoved.success) {
        response = {
          message: commentRemoved.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Comentário removido com sucesso!',
        success: true,
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

  public async updateComment(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const comment: CommentI = req.body;

      if (!comment || !comment.id || !comment.content) {
        response = {
          message: 'Dados incompletos para atualizar o comentário.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const commentUpdated: ResponseI = await TaskService.updateComment(comment);

      if (!commentUpdated.success) {
        response = {
          message: commentUpdated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Comentário atualizado com sucesso!',
        success: true,
        data: commentUpdated.data,
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
  public async deleteAttachment(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const attachmentId: number = parseInt(req.params.attachmentId);

      if (!attachmentId) {
        response = {
          message: 'Id do anexo não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const attachmentRemoved: ResponseI = await TaskService.removeFile(attachmentId);

      if (!attachmentRemoved.success) {
        response = {
          message: attachmentRemoved.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Anexo removido com sucesso!',
        success: true,
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
