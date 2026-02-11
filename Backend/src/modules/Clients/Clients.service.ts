import { DB } from "../../database/conn.js";
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

  public async getClients() {
    try {
      const pool = DB.connect();
      const query = `SELECT * FROM clientes`;

      const result = await pool.query(query);

      return {
        success: true,
        message: "Clientes carregados com sucesso",
        clientes: result?.rows ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao exibir Clientes: ", error);
      return {
        success: false,
        message: "erro ao buscar Clientes",
      };
    }
  }

  public async updateClient(id: string, clientes: Partial<clientsTypes>) {
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

      if (!id) {
        return {
          success: false,
          message: "Id do cliente é obrigatório",
        };
      }

      const requiredNome = nome_completo?.toString().trim();
      const requiredTipo = tipo_de_cliente?.toString().trim();

      if (!requiredNome) {
        return {
          success: false,
          message: "Nome do cliente é obrigatório",
        };
      }

      if (!requiredTipo) {
        return {
          success: false,
          message: "Tipo de cliente é obrigatório",
        };
      }

      const query = `
        UPDATE clientes
        SET
          nome_completo = $1,
          tipo_de_cliente = $2,
          cpf_cnpj = $3,
          email = $4,
          telefone = $5,
          cidade = $6,
          endereco = $7,
          obs = $8,
          status = $9
        WHERE id = $10
        RETURNING *;
      `;

      const values = [
        requiredNome,
        requiredTipo,
        cpf_cnpj ?? null,
        email ?? null,
        telefone ?? null,
        cidade ?? null,
        endereco ?? null,
        obs ?? null,
        status === false ? false : true,
        id,
      ];

      const result = await pool.query(query, values);

      if (!result.rows[0]) {
        return {
          success: false,
          message: "Cliente não encontrado",
        };
      }

      return {
        success: true,
        message: "Cliente atualizado com sucesso",
        cliente: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao atualizar cliente: ", error);
      return {
        success: false,
        message: "Erro ao atualizar cliente",
      };
    }
  }

  public async deleteClient(id: string) {
    try {
      const pool = DB.connect();

      if (!id) {
        return {
          success: false,
          message: "Id do cliente é obrigatório",
        };
      }

      const query = `DELETE FROM clientes WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (!result.rows[0]) {
        return {
          success: false,
          message: "Cliente não encontrado",
        };
      }

      return {
        success: true,
        message: "Cliente excluído com sucesso",
        cliente: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao excluir cliente: ", error);
      return {
        success: false,
        message: "Erro ao excluir cliente",
      };
    }
  }
}
