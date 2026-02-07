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
      const porMes: Record<string, { valor: number; label: string; year: number; month: number }> = {};

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
          porMes[shortKey] = { valor, label, year: item.year, month: item.month };
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
}
