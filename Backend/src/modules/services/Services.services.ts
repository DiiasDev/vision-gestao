import { DB } from "../../../database/conn.js";
import { type ServicesTypes } from "../../types/Services/Services.types.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultImagePath = path.resolve(__dirname, "../../img/serviceImg.png");

const getDefaultServiceImage = () => {
  try {
    const file = fs.readFileSync(defaultImagePath);
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch (error) {
    console.error("Erro ao carregar imagem padrão de serviço:", error);
    return null;
  }
};

const defaultServiceImage = getDefaultServiceImage();

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
      const normalizedImage =
        imagem && String(imagem).trim() ? imagem : defaultServiceImage;

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
        normalizedImage,
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

  public async getServices() {
    try {
      const pool = DB.connect();

      const query = `SELECT * FROM servicos`;

      const servicos = await pool.query(query);

      return {
        success: true,
        message: "serviços listados",
        servicos: servicos.rows ?? [],
      };
    } catch (error: any) {
      console.error("erro ao listar serviços: ", error);
      return {
        success: false,
        message: "erro ao listar serviços",
        servicos: [],
      };
    }
  }
}
