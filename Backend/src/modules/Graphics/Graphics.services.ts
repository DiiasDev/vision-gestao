import { ServicesService } from "./../services/Services.services.js";
import { FinanceService } from "../Finance/Finance.services.js";
import moment from "moment";

export class GraphicsServices {
  public finance = new FinanceService();
  public services = new ServicesService();

  public async vendasMensais() {
    try {
      const initialDate = moment().startOf("month");
      const endDate = moment().endOf("month");

      const financeData = (await this.finance.listMovements()).movements ?? [];

      const vendasMensais = financeData.filter((data: any) =>
        moment(data.date).isBetween(initialDate, endDate, undefined, "[]"),
      );

      const somaValor = vendasMensais.reduce(
        (acc: number, item: any) => acc + (item.value ?? 0),
        0,
      );

      return {
        success: true,
        message: "Sucesso ao somar vendas mensais",
        vendasMensais: somaValor,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Erro ao exibir valores de vendas mensais",
        vendasMensais: [],
      };
    }
  }
}
