import { DB } from "../../../database/conn.js";
import { ServicesService } from "./../services/Services.services.js";
import { FinanceService } from "../Finance/Finance.services.js";
import moment from "moment";

export class GraphicsServices {
  public finance = new FinanceService();
  public services = new ServicesService();

  public async vendasMensais(monthsCount = 6) {
    try {
      const safeMonths = Math.max(1, Math.min(Number(monthsCount) || 6, 12));
      const financeData = (await this.finance.listMovements()).movements ?? [];

      const monthKeys = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];
      const monthLabels = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];

      const meses = [];
      const porMes: Record<
        string,
        { valor: number; label: string; year: number; month: number }
      > = {};

      for (let i = safeMonths - 1; i >= 0; i -= 1) {
        const current = moment().subtract(i, "months");
        const initialDate = current.clone().startOf("month");
        const endDate = current.clone().endOf("month");

        const vendasDoMes = financeData.filter((data: any) =>
          moment(data.date).isBetween(initialDate, endDate, undefined, "[]"),
        );

        const entradas = vendasDoMes.filter((data: any) => data.type === "in");

        const somaValor = entradas.reduce((acc: number, item: any) => {
          const rawValue = item.value ?? 0;
          const value =
            typeof rawValue === "number"
              ? rawValue
              : Number(String(rawValue ?? 0).replace(",", "."));
          return acc + (Number.isFinite(value) ? value : 0);
        }, 0);

        const monthIndex = current.month();
        const label = monthLabels[monthIndex] ?? "";
        const shortKey = monthKeys[monthIndex] ?? "";
        const valor = somaValor;
        const item = {
          id: current.format("YYYY-MM"),
          key: shortKey,
          label,
          valor,
          year: current.year(),
          month: monthIndex + 1,
        };
        meses.push(item);
        if (shortKey) {
          porMes[shortKey] = {
            valor,
            label,
            year: item.year,
            month: item.month,
          };
        }
      }

      return {
        success: true,
        message: "Sucesso ao listar vendas mensais",
        meses,
        porMes,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Erro ao exibir valores de vendas mensais",
        meses: [],
        porMes: {},
      };
    }
  }

  public async valuesCards() {
    try {
      const response = await this.finance.listMovements();
      const movements = response?.movements ?? [];

      const normalizeValue = (raw: any) => {
        if (raw === undefined || raw === null || raw === "") return 0;
        if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
        const text = String(raw).trim();
        if (!text) return 0;
        const normalized = text.includes(",")
          ? text.replace(/\./g, "").replace(",", ".")
          : text;
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const now = moment();
      const currentStart = now.clone().startOf("year");
      const currentEnd = now.clone().endOf("year");
      const previousStart = currentStart
        .clone()
        .subtract(1, "year")
        .startOf("year");
      const previousEnd = currentStart.clone().subtract(1, "day").endOf("day");

      const isInRange = (date: any, start: moment.Moment, end: moment.Moment) =>
        moment(date).isBetween(start, end, undefined, "[]");

      const currentMovements = movements.filter((item: any) =>
        isInRange(item.date, currentStart, currentEnd),
      );
      const previousMovements = movements.filter((item: any) =>
        isInRange(item.date, previousStart, previousEnd),
      );

      const despesas = currentMovements.filter(
        (item: any) => item.type === "out",
      );

      const totalDespesas = despesas.reduce((acc: number, item: any) => {
        const valor = normalizeValue(item.value);
        return acc + valor;
      }, 0);

      const serviceCostsResult = await DB.connect().query(
        `
          SELECT
            valor_total,
            custo_total,
            data_servico,
            criado_em
          FROM servicos_realizados
        `
      );

      const serviceCosts = (serviceCostsResult.rows ?? []).filter((row: any) => {
        const date = row.data_servico ?? row.criado_em;
        return date ? isInRange(date, currentStart, currentEnd) : false;
      });

      const totalFaturamento = serviceCosts.reduce((acc: number, row: any) => {
        const valor = normalizeValue(row.valor_total);
        return acc + valor;
      }, 0);

      const totalServiceCosts = serviceCosts.reduce((acc: number, row: any) => {
        const valor = normalizeValue(row.custo_total);
        return acc + valor;
      }, 0);

      const totalCosts = totalServiceCosts;
      const saldo = totalFaturamento - totalCosts;

      const previousServiceCosts = (serviceCostsResult.rows ?? []).filter(
        (row: any) => {
          const date = row.data_servico ?? row.criado_em;
          return date ? isInRange(date, previousStart, previousEnd) : false;
        },
      );

      const previousFaturamento = previousServiceCosts.reduce(
        (acc: number, row: any) => acc + normalizeValue(row.valor_total),
        0,
      );

      const faturamentoPercent =
        previousFaturamento > 0
          ? ((totalFaturamento - previousFaturamento) / previousFaturamento) *
            100
          : null;

      const custoPercent =
        totalFaturamento > 0 ? (totalCosts / totalFaturamento) * 100 : 0;

      return {
        success: true,
        data: {
          faturamento: totalFaturamento,
          custo: totalCosts,
          saldo: saldo,
          faturamentoPercent,
          custoPercent,
        },
      };
    } catch (error: any) {
      console.error("Erro ao trazer valores dos cards:", error);

      return {
        success: false,
        data: {
          faturamento: 0,
          custo: 0,
          saldo: 0,
          faturamentoPercent: null,
          custoPercent: 0,
        },
        message: "Erro ao trazer valores dos cards",
      };
    }
  }

  public async custoXlucro() {
    try {
      const os = (await this.services.getServicesRealized()).services_realized;

      const normalizeValue = (raw: any) => {
        if (raw === undefined || raw === null || raw === "") return 0;
        if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
        const normalized = String(raw)
          .trim()
          .replace(/\./g, "")
          .replace(",", ".");
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const agrupado = os.reduce((acc: any, item: any) => {
        const servicoId = String(item.servico_id ?? "outros");
        const servicoNome = String(item.servico_nome ?? "Outros");
        const valor = normalizeValue(item.valor_total ?? item.valor_servico);
        const custo = normalizeValue(item.custo_total ?? item.custo_servico);

        if (!acc[servicoId]) {
          acc[servicoId] = {
            servicoId,
            servicoNome,
            totalValor: 0,
            totalCusto: 0,
            quantidade: 0,
          };
        }

        acc[servicoId].totalValor += valor;
        acc[servicoId].totalCusto += custo;
        acc[servicoId].quantidade += 1;
        return acc;
      }, {});

      const servicos = Object.values(agrupado).map((item: any) => {
        const lucroTotal = item.totalValor - item.totalCusto;
        const media = item.quantidade > 0 ? lucroTotal / item.quantidade : 0;
        return {
          ...item,
          totalVenda: item.totalValor,
          lucroTotal,
          media,
        };
      });

      const allValues = servicos.flatMap((item: any) => [
        item.totalValor,
        item.totalCusto,
        item.lucroTotal,
      ]);
      const maxValue = allValues.length
        ? Math.max(...allValues.map((value: any) => (Number.isFinite(value) ? value : 0)))
        : 0;
      const shouldScaleBy100 =
        allValues.length > 0 &&
        maxValue >= 10000 &&
        allValues.every(
          (value: any) => Number.isFinite(value) && value % 100 === 0,
        );

      if (shouldScaleBy100) {
        servicos.forEach((item: any) => {
          item.totalValor = item.totalValor / 100;
          if (item.totalVenda !== undefined) {
            item.totalVenda = item.totalVenda / 100;
          }
          item.totalCusto = item.totalCusto / 100;
          item.lucroTotal = item.lucroTotal / 100;
          item.media = item.media / 100;
        });
      }

      const totalValor = servicos.reduce((acc, s: any) => acc + s.totalValor, 0);
      const totalCusto = servicos.reduce((acc, s: any) => acc + s.totalCusto, 0);
      const lucroTotal = totalValor - totalCusto;
      const qtdServicos = servicos.reduce(
        (acc, s: any) => acc + s.quantidade,
        0,
      );
      const media = qtdServicos > 0 ? lucroTotal / qtdServicos : 0;

      const data = {
        totalValor,
        totalVenda: totalValor,
        totalCusto,
        lucroTotal,
        media,
        qtdServicos,
        servicos,
      };

      return {
        success: true,
        message: "Sucesso ao trazer dados para custoXlucro",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Erro ao calcular valor para custoXlucro",
        data: { custo: 0, lucro: 0 },
      };
    }
  }
}
