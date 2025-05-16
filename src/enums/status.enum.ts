export enum TaskStatusEnum {
  PENDING = 0, // Aguardando início
  IN_PROGRESS = 1, // Em andamento
  BLOCKED = 2, // Travada por algum motivo
  REVIEW = 3, // Em revisão
  DONE = 4, // Finalizada
  CANCELED = 5, // Cancelada
}

export enum VersionStatusEnum {
  DRAFT = 0, // Rascunho
  TESTING = 1, // Em testes
  STAGING = 2, // Preparada pro deploy
  RELEASED = 3, // Já lançada
  DEPRECATED = 4, // Obsoleta
  ROLLED_BACK = 5, // Revertida por bugão
}
