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
