export enum TaskStatusEnum {
  PENDING = 1, // Aguardando início
  IN_PROGRESS = 2, // Em andamento
  REVIEW = 3, // Em testes
  DONE = 4, // Concluída
  CANCELED = 5, // Cancelada
}

export enum VersionStatusEnum {
  DRAFT = 1, // Rascunho
  TESTING = 2, // Em testes
  STAGING = 3, // Preparada pro deploy
  RELEASED = 4, // Já lançada
  DEPRECATED = 5, // Obsoleta
  ROLLED_BACK = 6, // Revertida por bugão
}

export const TaskStatus = [
  {
    id: TaskStatusEnum.PENDING,
    name: 'Pendente',
    color: 'grey-6',
  },
  {
    id: TaskStatusEnum.IN_PROGRESS,
    name: 'Em andamento',
    color: 'blue',
  },
  {
    id: TaskStatusEnum.REVIEW,
    name: 'Em testes',
    color: 'amber',
  },
  {
    id: TaskStatusEnum.DONE,
    name: 'Concluída',
    color: 'positive',
  },
  {
    id: TaskStatusEnum.CANCELED,
    name: 'Cancelada',
    color: 'grey-8',
  },
];
