import { ResponseI } from '../interfaces/response.interface';
import { Comment, CommentI } from '../models/comment.model';
import { Task } from '../models/task.models';
import { User } from '../models/user.model';

export default class CommentService {
  public static async create(comment: CommentI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!comment || !comment.taskId || !comment.authorId || !comment.content) {
        response = {
          message: 'Dados incompletos para adicionar comentário.',
          success: false,
        };
        return response;
      }

      const taskExists = await Task.findByPk(comment.taskId);
      if (!taskExists) {
        response = {
          message: 'Tarefa não encontrada.',
          success: false,
        };
        return response;
      }

      const createdComment = await Comment.create({
        taskId: comment.taskId,
        authorId: comment.authorId,
        authorRole: comment.authorRole,
        content: comment.content,
        edited: !!comment.edited,
      });

      if (!createdComment) {
        response = {
          message: 'Erro ao adicionar comentário, consulte o Log.',
          success: false,
        };
        return response;
      }

      const newComment = await Comment.findByPk(createdComment.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'fullName', 'username', 'image'],
          },
        ],
      });

      response = {
        message: 'Comentário adicionado com sucesso!',
        success: true,
        data: newComment,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao adicionar comentário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async delete(commentId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!commentId) {
        response = {
          message: 'Id do comentário não informado!',
          success: false,
        };
        return response;
      }

      const commentExists = await Comment.findByPk(commentId);
      if (!commentExists) {
        response = {
          message: 'Comentário não encontrado.',
          success: false,
        };
        return response;
      }

      const deletedRows = await Comment.destroy({
        where: { id: commentId },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhum comentário foi removido.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Comentário removido com sucesso!',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover comentário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async update(comment: CommentI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!comment || !comment.id || !comment.content) {
        response = {
          message: 'Dados incompletos para atualizar o comentário.',
          success: false,
        };
        return response;
      }

      const commentExists = await Comment.findByPk(comment.id);
      if (!commentExists) {
        response = {
          message: 'Comentário não encontrado.',
          success: false,
        };
        return response;
      }

      const [rowsAffected, [updatedComment]] = await Comment.update(
        {
          content: comment.content,
          authorRole: comment.authorRole,
          edited: true,
        },
        { where: { id: comment.id }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhum comentário foi atualizado.',
          success: false,
        };
        return response;
      }

      const newComment = await Comment.findByPk(updatedComment.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'fullName', 'username', 'image'],
          },
        ],
      });

      response = {
        message: 'Comentário atualizado com sucesso!',
        success: true,
        data: newComment,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar comentário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
