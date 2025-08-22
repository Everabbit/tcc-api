export enum RolesEnum {
  ADMIN = 1,
  MANAGER = 2,
  DEVELOPER = 3,
  VIEWER = 4,
}

export const RolesValues = [
  {
    id: RolesEnum.ADMIN,
    name: 'Administrador',
  },
  {
    id: RolesEnum.MANAGER,
    name: 'Gerente',
  },
  {
    id: RolesEnum.DEVELOPER,
    name: 'Desenvolvedor',
  },
  {
    id: RolesEnum.VIEWER,
    name: 'Visualizador',
  },
];
