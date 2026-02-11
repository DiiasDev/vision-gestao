import { ServicesService } from "./../services/Services.services.js";
import { FinanceService } from "../Finance/Finance.services.js";
import { ProductsService } from "../products/products.service.js";
import moment from "moment";
export class GraphicsServices {
    finance = new FinanceService();
    services = new ServicesService();
    products = new ProductsService();
    resolveRange(startDate, endDate) {
        const start = startDate ? moment(startDate).startOf("day") : null;
        const end = endDate ? moment(endDate).endOf("day") : null;
        if (start && end && start.isValid() && end.isValid()) {
            return { start, end };
        }
        return null;
    }
    parseDate(raw) {
        if (!raw)
            return null;
        if (raw instanceof Date) {
            const parsed = moment(raw);
            return parsed.isValid() ? parsed : null;
        }
        if (typeof raw === "number") {
            const parsed = moment(raw);
            return parsed.isValid() ? parsed : null;
        }
        const trimmed = String(raw).trim();
        const normalized = trimmed.replace(/ ([+-]\d{2})(\d{2})$/, " $1:$2");
        const parsed = moment.parseZone(normalized, [
            moment.ISO_8601,
            "YYYY-MM-DD",
            "YYYY-MM-DDTHH:mm:ss.SSSZ",
            "YYYY-MM-DDTHH:mm:ss.SSSZZ",
            "YYYY-MM-DD HH:mm:ss.SSS ZZ",
            "YYYY-MM-DD HH:mm:ss.SSS Z",
            "YYYY-MM-DD HH:mm:ss ZZ",
            "YYYY-MM-DD HH:mm:ss Z",
            "YYYY-MM-DD HH:mm:ss",
            "YYYY-MM-DD HH:mm:ss.SSS",
            "DD/MM/YYYY",
            "DD/MM/YY",
        ], true);
        if (parsed.isValid())
            return parsed;
        const fallback = moment(trimmed);
        return fallback.isValid() ? fallback : null;
    }
    async vendasMensais(monthsCount = 6, range) {
        try {
            const safeMonths = Math.max(1, Math.min(Number(monthsCount) || 6, 12));
            const financeData = (await this.finance.listMovements()).movements ?? [];
            const resolvedRange = this.resolveRange(range?.startDate, range?.endDate);
            if (resolvedRange) {
                console.log("[vendasMensais] range:", {
                    start: resolvedRange.start.format(),
                    end: resolvedRange.end.format(),
                    count: financeData.length,
                });
                const sample = financeData[0];
                if (sample) {
                    const rawDate = sample.date ?? sample.created_at ?? sample.updated_at ?? null;
                    const parsed = this.parseDate(rawDate);
                    console.log("[vendasMensais] sample date:", {
                        raw: rawDate,
                        parsed: parsed ? parsed.format() : null,
                    });
                }
            }
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
            const porMes = {};
            if (resolvedRange) {
                const monthStart = resolvedRange.start.clone().startOf("month");
                const monthEnd = resolvedRange.end.clone().startOf("month");
                const months = [];
                let cursor = monthStart.clone();
                while (cursor.isSameOrBefore(monthEnd, "month")) {
                    months.push(cursor.clone());
                    cursor = cursor.add(1, "month");
                }
                for (const current of months) {
                    const initialDate = current.clone().startOf("month");
                    const endDate = current.clone().endOf("month");
                    const filterStart = moment.max(initialDate, resolvedRange.start);
                    const filterEnd = moment.min(endDate, resolvedRange.end);
                    const vendasDoMes = financeData.filter((data) => {
                        const parsedDate = this.parseDate(data.date ??
                            data.movement_date ??
                            data.created_at ??
                            data.updated_at);
                        if (!parsedDate)
                            return false;
                        return parsedDate.isBetween(filterStart, filterEnd, undefined, "[]");
                    });
                    const entradas = vendasDoMes.filter((data) => data.type === "in");
                    const somaValor = entradas.reduce((acc, item) => {
                        const rawValue = item.value ?? 0;
                        const value = typeof rawValue === "number"
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
                    console.log("[vendasMensais] month:", {
                        month: item.id,
                        total: somaValor,
                        entries: entradas.length,
                    });
                }
            }
            else {
                for (let i = safeMonths - 1; i >= 0; i -= 1) {
                    const current = moment().subtract(i, "months");
                    const initialDate = current.clone().startOf("month");
                    const endDate = current.clone().endOf("month");
                    const vendasDoMes = financeData.filter((data) => {
                        const parsedDate = this.parseDate(data.date ??
                            data.movement_date ??
                            data.created_at ??
                            data.updated_at);
                        if (!parsedDate)
                            return false;
                        return parsedDate.isBetween(initialDate, endDate, undefined, "[]");
                    });
                    const entradas = vendasDoMes.filter((data) => data.type === "in");
                    const somaValor = entradas.reduce((acc, item) => {
                        const rawValue = item.value ?? 0;
                        const value = typeof rawValue === "number"
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
            }
            return {
                success: true,
                message: "Sucesso ao listar vendas mensais",
                meses,
                porMes,
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Erro ao exibir valores de vendas mensais",
                meses: [],
                porMes: {},
            };
        }
    }
    async valuesCards(range) {
        try {
            const response = await this.finance.listMovements();
            const movements = response?.movements ?? [];
            const normalizeValue = (raw) => {
                if (raw === undefined || raw === null || raw === "")
                    return 0;
                if (typeof raw === "number")
                    return Number.isFinite(raw) ? raw : 0;
                const text = String(raw).trim();
                if (!text)
                    return 0;
                const normalized = text.includes(",")
                    ? text.replace(/\./g, "").replace(",", ".")
                    : text;
                const parsed = Number(normalized);
                return Number.isFinite(parsed) ? parsed : 0;
            };
            const resolvedRange = this.resolveRange(range?.startDate, range?.endDate);
            const now = moment();
            const currentStart = resolvedRange
                ? resolvedRange.start.clone()
                : now.clone().startOf("year");
            const currentEnd = resolvedRange
                ? resolvedRange.end.clone()
                : now.clone().endOf("year");
            const diffDays = currentEnd.diff(currentStart, "days") + 1;
            const previousEnd = currentStart.clone().subtract(1, "day").endOf("day");
            const previousStart = previousEnd
                .clone()
                .subtract(diffDays - 1, "days")
                .startOf("day");
            const isInRange = (date, start, end) => {
                const parsedDate = this.parseDate(date);
                if (!parsedDate)
                    return false;
                return parsedDate.isBetween(start, end, undefined, "[]");
            };
            const currentMovements = movements.filter((item) => isInRange(item.date, currentStart, currentEnd));
            const previousMovements = movements.filter((item) => isInRange(item.date, previousStart, previousEnd));
            const faturamento = currentMovements.filter((item) => item.type === "in");
            const totalFaturamento = faturamento.reduce((acc, item) => {
                const valor = normalizeValue(item.value);
                return acc + valor;
            }, 0);
            const despesas = currentMovements.filter((item) => item.type === "out");
            const totalDespesas = despesas.reduce((acc, item) => {
                const valor = normalizeValue(item.value);
                return acc + valor;
            }, 0);
            const saldo = totalFaturamento - totalDespesas;
            const previousFaturamento = previousMovements
                .filter((item) => item.type === "in")
                .reduce((acc, item) => acc + normalizeValue(item.value), 0);
            const faturamentoPercent = previousFaturamento > 0
                ? ((totalFaturamento - previousFaturamento) / previousFaturamento) *
                    100
                : null;
            const custoPercent = totalFaturamento > 0 ? (totalDespesas / totalFaturamento) * 100 : 0;
            return {
                success: true,
                data: {
                    faturamento: totalFaturamento,
                    custo: totalDespesas,
                    saldo: saldo,
                    faturamentoPercent,
                    custoPercent,
                },
            };
        }
        catch (error) {
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
    async custoXlucro(range) {
        try {
            const os = (await this.services.getServicesRealized()).services_realized;
            const resolvedRange = this.resolveRange(range?.startDate, range?.endDate);
            if (resolvedRange) {
                console.log("[custoXlucro] range:", {
                    start: resolvedRange.start.format(),
                    end: resolvedRange.end.format(),
                    count: os.length,
                });
                const sample = os[0];
                if (sample) {
                    const rawDate = sample.data_servico ?? sample.criado_em ?? null;
                    const parsed = this.parseDate(rawDate);
                    console.log("[custoXlucro] sample date:", {
                        raw: rawDate,
                        parsed: parsed ? parsed.format() : null,
                    });
                }
            }
            const osFiltered = resolvedRange
                ? os.filter((item) => {
                    const rawDate = item.data_servico ??
                        item.criado_em ??
                        item.created_at ??
                        item.updated_at;
                    const parsedDate = this.parseDate(rawDate);
                    if (!parsedDate)
                        return false;
                    return parsedDate.isBetween(resolvedRange.start, resolvedRange.end, undefined, "[]");
                })
                : os;
            if (resolvedRange) {
                console.log("[custoXlucro] filtered:", {
                    count: osFiltered.length,
                });
            }
            const normalizeValue = (raw) => {
                if (raw === undefined || raw === null || raw === "")
                    return 0;
                if (typeof raw === "number")
                    return Number.isFinite(raw) ? raw : 0;
                const normalized = String(raw)
                    .trim()
                    .replace(/\./g, "")
                    .replace(",", ".");
                const parsed = Number(normalized);
                return Number.isFinite(parsed) ? parsed : 0;
            };
            const agrupado = osFiltered.reduce((acc, item) => {
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
            const servicos = Object.values(agrupado).map((item) => {
                const lucroTotal = item.totalValor - item.totalCusto;
                const media = item.quantidade > 0 ? lucroTotal / item.quantidade : 0;
                return {
                    ...item,
                    totalVenda: item.totalValor,
                    lucroTotal,
                    media,
                };
            });
            const allValues = servicos.flatMap((item) => [
                item.totalValor,
                item.totalCusto,
                item.lucroTotal,
            ]);
            const maxValue = allValues.length
                ? Math.max(...allValues.map((value) => Number.isFinite(value) ? value : 0))
                : 0;
            const shouldScaleBy100 = allValues.length > 0 &&
                maxValue >= 10000 &&
                allValues.every((value) => Number.isFinite(value) && value % 100 === 0);
            if (shouldScaleBy100) {
                servicos.forEach((item) => {
                    item.totalValor = item.totalValor / 100;
                    if (item.totalVenda !== undefined) {
                        item.totalVenda = item.totalVenda / 100;
                    }
                    item.totalCusto = item.totalCusto / 100;
                    item.lucroTotal = item.lucroTotal / 100;
                    item.media = item.media / 100;
                });
            }
            const totalValor = servicos.reduce((acc, s) => acc + s.totalValor, 0);
            const totalCusto = servicos.reduce((acc, s) => acc + s.totalCusto, 0);
            const lucroTotal = totalValor - totalCusto;
            const qtdServicos = servicos.reduce((acc, s) => acc + s.quantidade, 0);
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
        }
        catch (error) {
            return {
                success: false,
                message: "Erro ao calcular valor para custoXlucro",
                data: { custo: 0, lucro: 0 },
            };
        }
    }
    async statusOS(range) {
        try {
            const os = (await this.services.getServicesRealized()).services_realized;
            const resolvedRange = this.resolveRange(range?.startDate, range?.endDate);
            const osFiltered = resolvedRange
                ? os.filter((item) => {
                    const rawDate = item.data_servico ??
                        item.criado_em ??
                        item.created_at ??
                        item.updated_at;
                    const parsedDate = this.parseDate(rawDate);
                    if (!parsedDate)
                        return false;
                    return parsedDate.isBetween(resolvedRange.start, resolvedRange.end, undefined, "[]");
                })
                : os;
            const normalizeStatus = (value) => {
                if (value === undefined || value === null)
                    return "";
                return String(value)
                    .trim()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/_/g, " ");
            };
            const statusList = osFiltered.map((item) => normalizeStatus(item.status));
            const concluidas = statusList.filter((status) => status === "concluido" || status === "concluida").length;
            const emExecucao = statusList.filter((status) => status === "em execucao").length;
            const agendadas = statusList.filter((status) => status === "agendado" || status === "agendada").length;
            const data = {
                concluidas: concluidas,
                emExecucao: emExecucao,
                agendadas: agendadas,
            };
            return {
                success: true,
                message: `Dados de status de OS: ${data}`,
                data: data,
            };
        }
        catch (error) {
            console.error("Erro ao trazer status de os: ", error);
            return {
                success: false,
                message: "Erro ao trazer status de os",
                data: {},
            };
        }
    }
    async servicosPorCategoria(range) {
        try {
            const servicesRealized = (await this.services.getServicesRealized()).services_realized ?? [];
            const servicesCatalog = (await this.services.getServices()).servicos ?? [];
            const categoryByServiceId = servicesCatalog.reduce((acc, item) => {
                const id = String(item.id ?? "").trim();
                if (!id)
                    return acc;
                const categoria = String(item.categoria ?? "").trim();
                if (categoria)
                    acc[id] = categoria;
                return acc;
            }, {});
            const resolvedRange = this.resolveRange(range?.startDate, range?.endDate);
            const startDate = resolvedRange
                ? resolvedRange.start
                : moment().subtract(30, "days").startOf("day");
            const endDate = resolvedRange ? resolvedRange.end : moment().endOf("day");
            const counts = servicesRealized.reduce((acc, item) => {
                const rawDate = item.data_servico ??
                    item.criado_em ??
                    item.created_at ??
                    item.updated_at;
                if (rawDate) {
                    const parsedDate = this.parseDate(rawDate);
                    if (!parsedDate)
                        return acc;
                    const isInRange = parsedDate.isBetween(startDate, endDate, undefined, "[]");
                    if (!isInRange)
                        return acc;
                }
                const servicoId = String(item.servico_id ?? "").trim();
                const categoriaRaw = categoryByServiceId[servicoId] ??
                    item.categoria ??
                    item.servico_categoria ??
                    "";
                const categoria = String(categoriaRaw || "Sem categoria").trim();
                acc[categoria] = (acc[categoria] ?? 0) + 1;
                return acc;
            }, {});
            const total = Object.values(counts).reduce((acc, value) => acc + value, 0);
            const categorias = Object.entries(counts)
                .map(([categoria, quantidade]) => {
                const percentual = total > 0 ? (quantidade / total) * 100 : 0;
                return {
                    categoria,
                    quantidade,
                    percentual,
                };
            })
                .sort((a, b) => b.quantidade - a.quantidade);
            const dias = Math.max(endDate.diff(startDate, "days") + 1, 1);
            return {
                success: true,
                message: "Dados trazidos com sucesso para servicos por categoria",
                data: {
                    total,
                    categorias,
                    dias,
                },
            };
        }
        catch (error) {
            console.error("erro ao trazer dados para servicos por categoria:", error);
            return {
                success: false,
                message: "erro ao trazer dados para servicos por categoria",
                data: {
                    total: 0,
                    categorias: [],
                    dias: 30,
                },
            };
        }
    }
    async estoqueCritico() {
        try {
            const getProdutos = (await this.products.getProducts());
            if (getProdutos.success == false) {
                console.error("erro ao trazer produtos");
                return;
            }
            const produtos = getProdutos.products ?? [];
            const estoqueBaixo = produtos?.filter((data) => data?.estoque <= 5);
            const data = estoqueBaixo.map((item) => ({
                id: item.id ?? "Item Sem ID",
                nome: item.nome ?? "Item Sem Nome",
                estoque: item.estoque ?? "Item Sem Estoque",
                unidade: item.unidade ?? "Item Sem Unidade De Medida"
            }));
            return {
                success: true,
                message: "Dados trazidos para estoque critico",
                products: data,
            };
        }
        catch (error) {
            console.error("erro em estoque Critico", error);
            return {
                success: false,
                message: "Erro em estoque Critico",
                data: {},
            };
        }
    }
    async rankingProdutos(range) {
        try {
            const result = await this.products.getStockMovements({ limit: 500 });
            if (!result?.success) {
                return {
                    success: false,
                    message: result?.message ?? "Erro ao buscar movimentacoes para ranking de produtos",
                    data: { totalSaidas: 0, produtos: [] },
                };
            }
            const resolvedRange = this.resolveRange(range?.startDate, range?.endDate);
            const movements = result.movements ?? [];
            const normalizeNumber = (raw) => {
                if (raw === undefined || raw === null || raw === "")
                    return 0;
                if (typeof raw === "number")
                    return Number.isFinite(raw) ? raw : 0;
                const parsed = Number(String(raw).replace(",", "."));
                return Number.isFinite(parsed) ? parsed : 0;
            };
            const filtered = movements.filter((item) => {
                const type = String(item?.tipo ?? item?.movement_type ?? "").toLowerCase();
                if (type !== "saida")
                    return false;
                if (!resolvedRange)
                    return true;
                const parsedDate = this.parseDate(item?.criado_em ?? item?.created_at ?? item?.date);
                if (!parsedDate)
                    return false;
                return parsedDate.isBetween(resolvedRange.start, resolvedRange.end, undefined, "[]");
            });
            const grouped = filtered.reduce((acc, item) => {
                const id = String(item?.produto_id ?? item?.product_id ?? "sem-id");
                const nome = String(item?.produto_nome ?? item?.product_name ?? "Produto sem nome").trim();
                if (!acc[id]) {
                    acc[id] = {
                        id,
                        nome: nome || "Produto sem nome",
                        quantidade: 0,
                    };
                }
                acc[id].quantidade += normalizeNumber(item?.quantidade ?? item?.quantity);
                return acc;
            }, {});
            const produtos = Object.values(grouped)
                .sort((a, b) => b.quantidade - a.quantidade)
                .slice(0, 5);
            const totalSaidas = produtos.reduce((acc, item) => acc + item.quantidade, 0);
            return {
                success: true,
                message: "Ranking de produtos calculado com sucesso",
                data: {
                    totalSaidas,
                    produtos,
                },
            };
        }
        catch (error) {
            console.error("erro ao calcular ranking de produtos:", error);
            return {
                success: false,
                message: "Erro ao calcular ranking de produtos",
                data: { totalSaidas: 0, produtos: [] },
            };
        }
    }
}
//# sourceMappingURL=Graphics.services.js.map