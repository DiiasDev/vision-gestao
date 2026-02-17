import { getApiBaseUrl } from "../config/api";

export type AuthTypes = { 
    email: string, 
    password: string,
    remember?: boolean
}

export class Auth{
    static async login({ email, password }: AuthTypes){
        try{
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`${getApiBaseUrl()}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha: password }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if(!response.ok){
                return { success: false, message: data?.message ?? "Falha no login" };
            }

            return data;
        }catch(error: any){
            console.error("Erro ao logar no sistema: ", error);
            const isAbort = error?.name === "AbortError";
            return { success: false, message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão" };
        }
    }
}
