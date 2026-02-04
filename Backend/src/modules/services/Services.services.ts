import { DB } from "../../../database/conn.js";
import { type ServicesTypes } from "../../types/Services/Services.types.js";

export class ServicesService {
  public async newService(novo_servico: Partial<ServicesTypes>) {
    try {
      const pool = DB.connect();

      const {
        nome_servico,
        categoria,
        preco,
        prazo,
        descricao,
        imagem,
        status,
      } = novo_servico;

      const query = `INSERT INTO servicos ( 
      nome_servico,
        categoria,
        preco,
        prazo,
        descricao,
        imagem,
        status) VALUES 
        ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;

      const values = [
        nome_servico,
        categoria,
        preco,
        prazo,
        descricao,
        imagem,
        status,
      ];

      const result = await pool.query(query, values);

      return {
        sucess: true,
        message: "Serviço registrado com sucesso",
        novo_servico: result.rows[0] ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao cadastrar Serviço", error);
      return {
        success: false,
        message: "erro ao cadastrar serviço",
        novo_servico: [],
      };
    }
  }
}
