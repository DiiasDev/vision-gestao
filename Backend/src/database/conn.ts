import { Pool } from "pg";

export class DB {
  private static pool: Pool;
  private static initPromise: Promise<void> | null = null;

  static connect(): Pool {
    if (!DB.pool) {
      DB.pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT ?? 5432),
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      DB.pool.on("error", (err) => {
        console.error("❌ Erro inesperado no PostgreSQL", err);
      });
    }

    return DB.pool;
  }

  static async init(): Promise<void> {
    if (DB.initPromise) {
      return DB.initPromise;
    }

    DB.initPromise = (async () => {
      const pool = DB.connect();

      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        CREATE TABLE IF NOT EXISTS clientes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome_completo TEXT NOT NULL,
          tipo_de_cliente TEXT NOT NULL,
          cpf_cnpj TEXT,
          email TEXT,
          telefone TEXT,
          cidade TEXT,
          endereco TEXT,
          obs TEXT,
          status BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS servicos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome_servico TEXT NOT NULL,
          categoria TEXT,
          preco NUMERIC(14,2),
          prazo TEXT,
          descricao TEXT,
          imagem TEXT,
          status BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS produtos (
          id SERIAL PRIMARY KEY,
          codigo TEXT,
          nome TEXT NOT NULL,
          categoria TEXT,
          sku TEXT,
          preco_venda NUMERIC(14,2) NOT NULL,
          custo NUMERIC(14,2),
          estoque NUMERIC(14,3) NOT NULL DEFAULT 0,
          unidade TEXT,
          descricao TEXT,
          imagem TEXT,
          ativo BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orcamentos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cliente_id TEXT,
          cliente_nome TEXT,
          contato TEXT,
          equipamento TEXT,
          problema TEXT,
          servico_id TEXT,
          servico_descricao TEXT,
          valor_servico NUMERIC(14,2) NOT NULL DEFAULT 0,
          valor_itens NUMERIC(14,2) NOT NULL DEFAULT 0,
          valor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
          validade TEXT,
          status TEXT NOT NULL DEFAULT 'em_analise',
          observacoes TEXT,
          criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
          atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orcamentos_itens (
          id BIGSERIAL PRIMARY KEY,
          orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
          produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
          produto_nome TEXT,
          quantidade NUMERIC(14,3) NOT NULL DEFAULT 0,
          preco_unitario NUMERIC(14,2) NOT NULL DEFAULT 0,
          total_item NUMERIC(14,2) NOT NULL DEFAULT 0,
          criado_em TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS servicos_realizados (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cliente_id TEXT,
          cliente_nome TEXT,
          contato TEXT,
          servico_id TEXT,
          servico_nome TEXT,
          equipamento TEXT,
          descricao TEXT,
          data_servico TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'em_execucao',
          valor_servico NUMERIC(14,2) NOT NULL DEFAULT 0,
          valor_produtos NUMERIC(14,2) NOT NULL DEFAULT 0,
          valor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
          custo_servico NUMERIC(14,2) NOT NULL DEFAULT 0,
          custo_produtos NUMERIC(14,2) NOT NULL DEFAULT 0,
          custo_total NUMERIC(14,2) NOT NULL DEFAULT 0,
          observacoes TEXT,
          criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
          atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS servicos_realizados_itens (
          id BIGSERIAL PRIMARY KEY,
          servico_realizado_id UUID NOT NULL REFERENCES servicos_realizados(id) ON DELETE CASCADE,
          produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
          produto_nome TEXT,
          quantidade NUMERIC(14,3) NOT NULL DEFAULT 0,
          preco_unitario NUMERIC(14,2) NOT NULL DEFAULT 0,
          total_item NUMERIC(14,2) NOT NULL DEFAULT 0,
          custo_unitario NUMERIC(14,2) NOT NULL DEFAULT 0,
          total_custo_item NUMERIC(14,2) NOT NULL DEFAULT 0,
          criado_em TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS finance_movements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          category TEXT,
          movement_date TIMESTAMP NOT NULL DEFAULT NOW(),
          value NUMERIC(14,2) NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pago',
          type TEXT NOT NULL CHECK (type IN ('in', 'out')),
          channel TEXT,
          notes TEXT,
          service_realized_id UUID REFERENCES servicos_realizados(id) ON DELETE SET NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
          id BIGSERIAL PRIMARY KEY,
          produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
          tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
          quantidade NUMERIC(14,3) NOT NULL,
          saldo_anterior NUMERIC(14,3) NOT NULL,
          saldo_atual NUMERIC(14,3) NOT NULL,
          descricao TEXT,
          origem TEXT,
          referencia_id TEXT,
          criado_por TEXT,
          criado_em TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_orcamentos_itens_orcamento_id
          ON orcamentos_itens (orcamento_id);
        CREATE INDEX IF NOT EXISTS idx_servicos_realizados_itens_servico_id
          ON servicos_realizados_itens (servico_realizado_id);
        CREATE INDEX IF NOT EXISTS idx_finance_movements_service_realized_id
          ON finance_movements (service_realized_id);
        CREATE INDEX IF NOT EXISTS idx_finance_movements_date
          ON finance_movements (movement_date DESC);
        CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_produto_id
          ON estoque_movimentacoes (produto_id);
      `);
    })();

    try {
      await DB.initPromise;
    } catch (error) {
      DB.initPromise = null;
      throw error;
    }
  }
}
