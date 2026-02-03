import { type UserModelTypes } from "../../types/Users/usersModel.types.js";
export class UsersModel {
  static tableName = "usuarios";

  static columns = {
    id: "id",
    nome_completo: "nome_completo",
    email: "email",
    senha: "senha",
    telefone: "telefone",
    criado_em: "criado_em",
    atualizado_em: "atualizado_em",
  } as const;
}
