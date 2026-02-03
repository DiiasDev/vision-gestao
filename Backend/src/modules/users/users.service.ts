import { type Users } from "../../types/Users/users.types.js";

export class UserService {
  private dataUser: Users[] = [
    {
      id: "1",
      nome_completo: "Luiz Fragnan",
      senha: "teste",
      email: "luizteste@gmail.com",
      telefone: "19991334884",
    },
  ];
  public loginUser(email: string, senha: string) {
    try {
      const usuarioEncontrado = this.dataUser.find(
        (user) => user.email === email,
      );

      if (!usuarioEncontrado) {
        return {
          success: false,
          message: "Usuário não encontrado",
        };
      }

      if (usuarioEncontrado.senha !== senha) {
        return {
          success: false,
          message: "Senha inválida",
        };
      }

      const { senha: _senha, ...userSemSenha } = usuarioEncontrado;

      return {
        success: true,
        message: "Login realizado com sucesso",
        user: userSemSenha,
      };
    } catch (error: any) {
      console.log("Erro no serviço de Login: ", error);

      return {
        success: false,
        message: "Erro interno ao realizar login",
      };
    }
  }
}
 
