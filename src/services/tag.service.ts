import { ResponseI } from '../interfaces/response.interface';
import { Tag, TagI } from '../models/tag.model';

export default class TagService {
  public static async create(tag: TagI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      if (!tag || !tag.name || !tag.projectId) {
        response = {
          message: 'Tag inválida, verifique os dados.',
          success: false,
        };
        return response;
      }

      const tagExists = await Tag.findOne({ where: { name: tag.name, projectId: tag.projectId } });
      if (tagExists) {
        response = {
          message: 'Já existe uma tag com este nome neste projeto.',
          success: false,
        };
        return response;
      }

      const newTag = await Tag.create({
        projectId: tag.projectId,
        name: tag.name,
        color: tag.color,
      });
      if (!newTag) {
        response = {
          message: 'Erro ao criar tag, consulte o Log.',
          success: false,
        };
        return response;
      }
      response = {
        message: 'Tag criada com sucesso.',
        success: true,
        data: newTag,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao criar tag, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async update(tag: TagI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!tag || !tag.id) {
        response = {
          message: 'Tag inválida, verifique os dados.',
          success: false,
        };
        return response;
      }

      const tagExists = await Tag.findOne({ where: { id: tag.id } });
      if (!tagExists) {
        response = {
          message: 'Tag não encontrada.',
          success: false,
        };
        return response;
      }

      const [rowsAffected, [updatedTag]] = await Tag.update(
        {
          name: tag.name,
          color: tag.color,
        },
        { where: { id: tag.id }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhuma tag foi atualizada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tag atualizada com sucesso.',
        success: true,
        data: updatedTag,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar tag, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async delete(tagId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!tagId) {
        response = {
          message: 'Id da tag não informado.',
          success: false,
        };
        return response;
      }

      const tagExists = await Tag.findOne({ where: { id: tagId } });
      if (!tagExists) {
        response = {
          message: 'Tag não encontrada.',
          success: false,
        };
        return response;
      }

      const deletedRows = await Tag.destroy({
        where: { id: tagId },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhuma tag foi removida.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tag removida com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover tag, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
  public static async getAll(projectId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado.',
          success: false,
        };
        return response;
      }

      const tags: TagI[] = await Tag.findAll({
        where: { projectId: projectId },
      });

      if (!tags || tags.length === 0) {
        response = {
          message: 'Nenhuma tag encontrada para este projeto.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Tags encontradas com sucesso.',
        success: true,
        data: tags,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar tags do projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
