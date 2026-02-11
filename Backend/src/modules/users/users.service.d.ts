export declare class UserService {
    private dataUser;
    loginUser(email: string, senha: string): {
        success: boolean;
        message: string;
        user?: never;
    } | {
        success: boolean;
        message: string;
        user: {
            id: string;
            nome_completo: string;
            email: string;
            telefone: string;
        };
    };
}
//# sourceMappingURL=users.service.d.ts.map