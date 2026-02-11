import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export type HomeInfoTopic =
  | "values_cards"
  | "vendas_mensais"
  | "custo_lucro"
  | "movimentacoes_recentes"
  | "servicos_categoria"
  | "status_os"
  | "estoque_critico"
  | "ranking_produtos";

type InfoModalProps = {
  visible: boolean;
  topic: HomeInfoTopic | null;
  onClose: () => void;
};

type TopicContent = {
  title: string;
  subtitle: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
  exampleTitle: string;
  example: string;
};

const INFO_CONTENT: Record<HomeInfoTopic, TopicContent> = {
  values_cards: {
    title: "Visao Geral do Caixa",
    subtitle: "Resumo financeiro consolidado do periodo filtrado.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "Faturamento soma todas as entradas registradas no periodo.",
          "Custos soma todas as saidas vinculadas a operacoes e despesas.",
          "Saldo em caixa representa faturamento menos custos.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Faturamento alto com custo alto pode indicar baixa margem.",
          "Saldo positivo recorrente aponta saude financeira no periodo.",
          "Os indicadores percentuais ajudam a comparar com historico.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "Se o faturamento foi R$ 18.000,00 e os custos R$ 11.500,00, o saldo em caixa sera R$ 6.500,00.",
  },
  vendas_mensais: {
    title: "Vendas Mensais",
    subtitle: "Evolucao das vendas de produtos e servicos por mes.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "Cada barra representa o total vendido no mes correspondente.",
          "O grafico considera o filtro de datas aplicado no topo da Home.",
          "Ao tocar na barra, o tooltip mostra o valor exato do mes.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Crescimento continuo indica aumento de demanda ou ticket medio.",
          "Queda brusca em um mes pede analise de campanhas e produtividade.",
          "Meses de pico podem orientar compras e escala da equipe.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "Jan: R$ 7.200,00, Fev: R$ 8.900,00, Mar: R$ 10.100,00. O padrao mostra tendencia de alta no trimestre.",
  },
  custo_lucro: {
    title: "Custos x Vendas por Servico",
    subtitle: "Comparativo de custo e receita por tipo de servico.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "A linha azul representa vendas, e a vermelha representa custos.",
          "Os servicos com maior venda aparecem primeiro para priorizar analise.",
          "Quando ha muitos servicos, os restantes sao agrupados em 'Outros'.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Quanto maior a distancia entre vendas e custos, maior o lucro.",
          "Se custo se aproxima da venda, a margem do servico esta baixa.",
          "A margem media e o lucro total do periodo aparecem abaixo do grafico.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "Troca de tela: venda R$ 450,00, custo R$ 210,00. Lucro do servico = R$ 240,00 e margem de 53,3%.",
  },
  movimentacoes_recentes: {
    title: "Movimentacoes Recentes",
    subtitle: "Ultimos lancamentos financeiros registrados no sistema.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "Mostra as 3 movimentacoes mais recentes por data de lancamento.",
          "Entradas aparecem com sinal + e saidas com sinal -.",
          "A lista usa os dados financeiros ja convertidos para visualizacao.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Ajuda a validar se os lancamentos do dia estao coerentes.",
          "Saidas inesperadas podem indicar erro de categoria ou valor.",
          "Entradas recorrentes em datas fixas ajudam no planejamento de caixa.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "09/02: + R$ 320,00 (Servico concluido), 09/02: - R$ 85,00 (Compra de peca), 10/02: + R$ 210,00 (Acessorio vendido).",
  },
  servicos_categoria: {
    title: "Servicos por Categoria",
    subtitle: "Distribuicao percentual de servicos realizados por categoria.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "O grafico de pizza divide o total conforme quantidade por categoria.",
          "O filtro de categorias permite incluir ou remover segmentos da analise.",
          "Ao tocar em uma categoria, o painel mostra percentual e quantidade.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Categorias maiores mostram onde esta o maior volume operacional.",
          "Categorias pequenas podem indicar oportunidade de divulgacao.",
          "Mudancas de participacao ao longo do tempo mostram tendencia de demanda.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "Total de 100 servicos: 45 trocas de tela (45%), 30 baterias (30%), 25 conectores (25%).",
  },
  status_os: {
    title: "Status das Ordens de Servico",
    subtitle: "Distribuicao de OS agendadas, em andamento e concluidas.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "Cada barra mostra a quantidade de OS por status no periodo filtrado.",
          "A largura da barra e proporcional ao total de OS do periodo.",
          "Os status principais sao: Agendadas, Em andamento e Concluidas.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Muitas OS agendadas podem indicar fila de atendimento crescendo.",
          "Muitas OS em andamento por muito tempo indicam gargalo operacional.",
          "Concluidas em alta mostram boa vazao da equipe tecnica.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "No periodo: 12 agendadas, 8 em andamento e 25 concluidas. Total = 45 OS, com 55,6% concluidas.",
  },
  estoque_critico: {
    title: "Estoque Critico",
    subtitle: "Itens com nivel baixo e necessidade de reposicao.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "Cada item mostra a quantidade atual e uma barra de nivel relativo.",
          "O percentual usa relacao entre quantidade atual e capacidade de referencia.",
          "Quanto menor a barra, maior o risco de falta do item.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Itens com baixa cobertura devem entrar primeiro na compra.",
          "Produtos de alto giro exigem ponto de reposicao mais conservador.",
          "Evitar ruptura reduz perda de vendas e atraso em servicos.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "Bateria iPhone 11 com 9 unidades de maximo 60 equivale a 15% do nivel, indicando reposicao urgente.",
  },
  ranking_produtos: {
    title: "Ranking de Produtos Mais Vendidos",
    subtitle: "Analise dos itens com maior saida no periodo filtrado.",
    sections: [
      {
        title: "Como funciona",
        items: [
          "O ranking soma as saidas de estoque por produto.",
          "Voce pode alternar entre visualizacao em lista e grafico.",
          "O filtro de datas da Home define o periodo considerado.",
        ],
      },
      {
        title: "Como interpretar",
        items: [
          "Itens no topo exigem reposicao mais frequente para evitar ruptura.",
          "Mudancas no ranking ajudam a prever sazonalidade de demanda.",
          "Combine com estoque critico para priorizar compras com impacto real.",
        ],
      },
    ],
    exampleTitle: "Exemplo rapido",
    example:
      "Se Pelicula 3D saiu 120 unidades e Bateria iPhone 11 saiu 85, a compra da pelicula deve ter prioridade de reposicao.",
  },
};

export function InfoModal({ visible, topic, onClose }: InfoModalProps) {
  if (!topic) return null;

  const content = INFO_CONTENT[topic];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-black/60 px-5">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="max-h-[85%] rounded-3xl border border-divider bg-card-background">
          <View className="rounded-t-3xl border-b border-divider bg-background-secondary/70 px-5 py-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xs uppercase tracking-widest text-state-info">
                  Guia da Home
                </Text>
                <Text className="mt-1 text-lg font-semibold text-text-primary">
                  {content.title}
                </Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  {content.subtitle}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="h-9 w-9 items-center justify-center rounded-full border border-divider bg-card-background"
              >
                <Ionicons name="close" size={17} color="#64748B" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="px-5 py-4"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {content.sections.map((section) => (
              <View key={section.title} className="mb-4 rounded-2xl bg-background-secondary px-4 py-3">
                <Text className="text-sm font-semibold text-text-primary">
                  {section.title}
                </Text>
                <View className="mt-2 gap-2">
                  {section.items.map((item, index) => (
                    <View key={`${section.title}-${index}`} className="flex-row items-start gap-2">
                      <View className="mt-1 h-1.5 w-1.5 rounded-full bg-state-info" />
                      <Text className="flex-1 text-sm leading-5 text-text-secondary">
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <View className="rounded-2xl border border-state-info/30 bg-state-info/10 px-4 py-3">
              <Text className="text-xs uppercase tracking-widest text-state-info">
                {content.exampleTitle}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-text-primary">
                {content.example}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
