import { UserService } from "./users.service.js";
export class UserController {
    user = new UserService();
    login(req, res) {
        try {
            const { email, senha } = req.body ?? {};
            if (!email || !senha) {
                return res.status(400).json({
                    success: false,
                    message: "Email e senha são obrigatórios",
                });
            }
            const result = this.user.loginUser(String(email), String(senha));
            const statusCode = result.success
                ? 200
                : result.message === "Usuário não encontrado"
                    ? 404
                    : 401;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            console.error("Erro no controller user: ", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao realizar login",
            });
        }
    }
}
//# sourceMappingURL=users.controller.js.map