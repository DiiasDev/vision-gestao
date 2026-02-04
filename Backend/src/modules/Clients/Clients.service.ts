import { DB } from "../../../database/conn.js";
import { type clientsTypes } from "../../types/Clients/ClientsTypes.js";

export class ClientsService {
  public async newClient(clientes: Partial<clientsTypes>) {
    try {
      const pool = DB.connect();
      const {
        nome_completo,
        tipo_de_cliente,
        cpf_cnpj,
        email,
        telefone,
        cidade,
        endereco,
        obs,
        status,
      } = clientes;

      const query = `INSERT INTO clientes (nome_completo,
                tipo_de_cliente, 
                cpf_cnpj, 
                email, 
                telefone, 
                cidade, 
                endereco, 
                obs, 
                status ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

      const values = [
        nome_completo,
        tipo_de_cliente,
        cpf_cnpj,
        email,
        telefone,
        cidade,
        endereco,
        obs,
        status,
      ];

      const result = await pool.query(query, values);

      return {
        success: true,
        message: "Novo Cliente cadastrado",
        novo_cliente: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao cadastrar novo cliente", error);
      return {
        success: false,
        message: "Erro ao cadastrar novo cliente",
        novo_cliente: "",
      };
    }
  }
}
