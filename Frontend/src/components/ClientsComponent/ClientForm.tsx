import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsClient } from "../../Fields/ClientForm";
import {
  ClienteService,
  type ClientPayload,
} from "../../services/Clients.services";

type ClientFormProps = {
  onBack?: () => void;
};

export default function ClientForm({ onBack }: ClientFormProps) {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  return (
    <View className="flex-1">
      <FormComponent
        fields={fieldsClient}
        title="Cadastrar cliente"
        subtitle="Cadastre os dados do cliente para histórico e cobranças."
        onBack={onBack}
        onSubmit={async (data) => {
          if (!data?.nome) {
            setAlert({
              type: "error",
              title: "Dados obrigatórios",
              message: "Informe o nome completo do cliente.",
            });
            return;
          }
          if (!data?.tipo) {
            setAlert({
              type: "error",
              title: "Dados obrigatórios",
              message: "Selecione o tipo de cliente.",
            });
            return;
          }
          const clientPayload: ClientPayload = {
            nome: data.nome,
            tipo: data.tipo,
            documento: data.documento,
            email: data.email,
            telefone: data.telefone,
            cidade: data.cidade,
            endereco: data.endereco,
            observacoes: data.observacoes,
            ativo: data.ativo,
          };
          const result = await ClienteService.createClient(clientPayload);
          if (result?.success) {
            setAlert({
              type: "success",
              title: "Cliente cadastrado",
              message: "O cliente foi salvo com sucesso.",
            });
          } else {
            setAlert({
              type: "error",
              title: "Erro ao cadastrar",
              message:
                result?.message ??
                "Não foi possível salvar o cliente. Tente novamente.",
            });
          }
        }}
      />

      {alert ? (
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 top-3 px-6"
        >
          <View
            className={`rounded-2xl border px-4 py-3 ${
              alert.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 pr-6">
                <View
                  className={`mt-1 h-7 w-7 items-center justify-center rounded-full ${
                    alert.type === "success" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  <Ionicons
                    name={alert.type === "success" ? "checkmark" : "alert"}
                    size={16}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    {alert.title}
                  </Text>
                  <Text className="mt-1 text-sm text-text-secondary">
                    {alert.message}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setAlert(null)}
                hitSlop={8}
                className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
