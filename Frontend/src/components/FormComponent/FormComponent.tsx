import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDateBR } from "../../utils/formatter";

export type FieldOption = {
  value: string;
  label: string;
  subtitle?: string;
};

export type Field = {
  fieldname: string;
  label: string;
  fieldtype: string;
  required?: boolean;
  options?: string[] | string;
  section?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  fullWidth?: boolean;
  disabled?: boolean;
};

type FormComponentProps = {
  fields: Field[];
  title: string;
  subtitle?: string;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  submitButtonText?: string;
  initialData?: Record<string, any> | null;
  onBack?: () => void;
  backButtonText?: string;
  cardClassName?: string;
  backButtonClassName?: string;
  backButtonTextClassName?: string;
};

type SelectState = {
  fieldname: string;
  label: string;
  options: FieldOption[];
};

type DateState = {
  fieldname: string;
  label: string;
};

const parseOptions = (options?: string[] | string): FieldOption[] => {
  if (!options) return [];
  const rawOptions = Array.isArray(options)
    ? options
    : String(options)
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

  return rawOptions.map((item) => {
    const parts = item.split("|").map((value) => value.trim());
    if (parts.length >= 2) {
      return {
        value: parts[0],
        label: parts[1],
        subtitle: parts[2],
      };
    }
    return { value: item.trim(), label: item.trim() };
  });
};

const resolveSelectLabel = (
  value: any,
  options: FieldOption[],
  placeholder?: string
) => {
  if (!value) return placeholder ?? "Selecione...";
  const match = options.find((item) => item.value === String(value));
  return match?.label ?? String(value);
};

export default function FormComponent({
  fields,
  title,
  subtitle,
  onSubmit,
  submitButtonText = "Salvar",
  initialData = null,
  onBack,
  backButtonText = "Voltar",
  cardClassName = "rounded-3xl border border-divider bg-card-background p-6",
  backButtonClassName = "rounded-full border border-divider px-3 py-1",
  backButtonTextClassName = "text-sm text-text-secondary",
}: FormComponentProps) {
  const resolvedInitialData = useMemo(
    () => initialData ?? {},
    [initialData]
  );
  const [formData, setFormData] =
    useState<Record<string, any>>(resolvedInitialData);
  const [loading, setLoading] = useState(false);
  const [activeSelect, setActiveSelect] = useState<SelectState | null>(null);
  const [activeImageField, setActiveImageField] = useState<string | null>(null);
  const [activeDateField, setActiveDateField] = useState<DateState | null>(null);
  const [dateDraft, setDateDraft] = useState<Date>(new Date());

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const groupedFields = useMemo(() => {
    return fields.reduce((acc, field) => {
      const section = field.section?.trim() || "Geral";
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {} as Record<string, Field[]>);
  }, [fields]);

  const handleChange = (fieldname: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldname]: value }));
  };

  const toDate = (value: any) => {
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (brMatch) {
        const parsed = new Date(
          Number(brMatch[3]),
          Number(brMatch[2]) - 1,
          Number(brMatch[1])
        );
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
      const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        const parsed = new Date(
          Number(isoMatch[1]),
          Number(isoMatch[2]) - 1,
          Number(isoMatch[3])
        );
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: Field) => {
    const rawValue = formData[field.fieldname];
    const value =
      rawValue !== undefined && rawValue !== null && rawValue !== ""
        ? rawValue
        : field.defaultValue ?? "";
    const normalizedType = field.fieldtype.toLowerCase();

    if (normalizedType === "date" || normalizedType === "datepicker") {
      const label = value ? formatDateBR(value) : field.placeholder ?? "Selecione...";
      return (
        <Pressable
          onPress={() => {
            if (field.disabled) return;
            setDateDraft(toDate(value));
            setActiveDateField({
              fieldname: field.fieldname,
              label: field.label,
            });
          }}
          className={`rounded-xl border border-divider px-4 py-3 bg-background-secondary ${
            field.disabled ? "opacity-60" : ""
          }`}
        >
          <Text
            className={`text-base ${
              value ? "text-text-primary" : "text-text-tertiary"
            }`}
          >
            {label}
          </Text>
        </Pressable>
      );
    }

    if (normalizedType === "select") {
      const options = parseOptions(field.options);
      const label = resolveSelectLabel(value, options, field.placeholder);

      return (
        <Pressable
          onPress={() => {
            if (field.disabled) return;
            setActiveSelect({
              fieldname: field.fieldname,
              label: field.label,
              options,
            });
          }}
          className={`rounded-xl border border-divider px-4 py-3 bg-background-secondary ${
            field.disabled ? "opacity-60" : ""
          }`}
        >
          <Text
            className={`text-base ${
              value ? "text-text-primary" : "text-text-tertiary"
            }`}
          >
            {label}
          </Text>
        </Pressable>
      );
    }

    if (normalizedType === "checkbox") {
      const checked = value === true || value === 1 || value === "1";

      return (
        <View className="flex-row items-center justify-between rounded-xl border border-divider bg-background-secondary px-4 py-2">
          <Text className="text-base text-text-primary">
            {checked ? "Ativo" : "Inativo"}
          </Text>
          <Switch
            value={checked}
            onValueChange={(next) =>
              handleChange(field.fieldname, next ? 1 : 0)
            }
            disabled={field.disabled}
          />
        </View>
      );
    }

    if (normalizedType === "image" || normalizedType === "attach image") {
      const imageUri =
        typeof value === "string"
          ? value
          : typeof value === "object" && value?.uri
            ? value.uri
            : null;

      return (
        <View className="gap-3">
          {imageUri ? (
            <View className="items-start gap-3">
              <Image
                source={{ uri: imageUri }}
                className="h-32 w-32 rounded-2xl border border-divider"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => handleChange(field.fieldname, null)}
                className="rounded-xl border border-divider px-4 py-2"
              >
                <Text className="text-sm text-text-secondary">
                  Remover imagem
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                if (field.disabled) return;
                setActiveImageField(field.fieldname);
              }}
              className={`rounded-2xl border border-dashed border-divider px-4 py-6 ${
                field.disabled ? "opacity-60" : ""
              }`}
            >
              <Text className="text-sm text-text-secondary">
                Toque para anexar uma imagem
              </Text>
            </Pressable>
          )}
        </View>
      );
    }

    if (normalizedType === "textarea") {
      return (
        <TextInput
          className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
          value={String(value)}
          onChangeText={(text) => handleChange(field.fieldname, text)}
          editable={!field.disabled}
          multiline
          textAlignVertical="top"
          numberOfLines={4}
        />
      );
    }

    const keyboardType =
      normalizedType === "number"
        ? "numeric"
        : normalizedType === "email"
          ? "email-address"
          : normalizedType === "tel"
            ? "phone-pad"
            : "default";

    return (
      <TextInput
        className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
        placeholder={field.placeholder}
        placeholderTextColor="#9CA3AF"
        value={String(value)}
        onChangeText={(text) => handleChange(field.fieldname, text)}
        editable={!field.disabled}
        secureTextEntry={normalizedType === "password"}
        keyboardType={keyboardType}
      />
    );
  };

  const sectionEntries = Object.entries(groupedFields);
  const shouldShowSections =
    sectionEntries.length > 1 || sectionEntries[0]?.[0] !== "Geral";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className={cardClassName}>
          <View className="mb-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-text-primary">
                {title}
              </Text>
              {onBack ? (
                <Pressable
                  onPress={onBack}
                  className={backButtonClassName}
                >
                  <Text className={backButtonTextClassName}>
                    {backButtonText}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {subtitle ? (
              <Text className="mt-2 text-sm text-text-secondary">
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View className="gap-6">
            {sectionEntries.map(([section, sectionFields]) => (
              <View key={section} className="gap-4">
                {shouldShowSections ? (
                  <Text className="text-base font-semibold text-text-primary">
                    {section}
                  </Text>
                ) : null}
                <View className="gap-4">
                  {sectionFields.map((field) => (
                    <View key={field.fieldname} className="gap-2">
                      <Text className="text-sm text-text-secondary">
                        {field.label}
                        {field.required ? (
                          <Text className="text-state-error"> *</Text>
                        ) : null}
                      </Text>
                      {renderField(field)}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className={`mt-8 items-center rounded-2xl bg-button-primary px-4 py-4 ${
              loading ? "opacity-70" : ""
            }`}
          >
            <Text className="text-base font-semibold text-white">
              {loading ? "Salvando..." : submitButtonText}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={!!activeSelect}
        animationType="fade"
        onRequestClose={() => setActiveSelect(null)}
      >
        <Pressable
          onPress={() => setActiveSelect(null)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full max-h-[70%] rounded-3xl bg-card-background p-5"
          >
            <Text className="text-lg font-semibold text-text-primary">
              {activeSelect?.label}
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Escolha uma opção para continuar.
            </Text>
            <View className="mt-4 gap-2">
              {activeSelect?.options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    handleChange(activeSelect.fieldname, option.value);
                    setActiveSelect(null);
                  }}
                  className="rounded-2xl border border-divider px-4 py-3"
                >
                  <Text className="text-base text-text-primary">
                    {option.label}
                  </Text>
                  {option.subtitle ? (
                    <Text className="text-xs text-text-tertiary">
                      {option.subtitle}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={!!activeDateField}
        animationType="fade"
        onRequestClose={() => setActiveDateField(null)}
      >
        <Pressable
          onPress={() => setActiveDateField(null)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full rounded-3xl bg-card-background p-5"
          >
            <Text className="text-lg font-semibold text-text-primary">
              {activeDateField?.label ?? "Selecionar data"}
            </Text>
            <View className="mt-4">
              <DateTimePicker
                value={dateDraft}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selected) => {
                  const chosen = selected ?? dateDraft;
                  setDateDraft(chosen);
                  if (Platform.OS === "android") {
                    if (event.type === "set" && activeDateField) {
                      handleChange(
                        activeDateField.fieldname,
                        formatDateBR(chosen)
                      );
                    }
                    setActiveDateField(null);
                  }
                }}
              />
            </View>
            {Platform.OS === "ios" ? (
              <Pressable
                onPress={() => {
                  if (!activeDateField) return;
                  handleChange(
                    activeDateField.fieldname,
                    formatDateBR(dateDraft)
                  );
                  setActiveDateField(null);
                }}
                className="mt-4 items-center rounded-2xl bg-button-primary px-4 py-3"
              >
                <Text className="text-sm font-semibold text-white">
                  Confirmar
                </Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={!!activeImageField}
        animationType="fade"
        onRequestClose={() => setActiveImageField(null)}
      >
        <Pressable
          onPress={() => setActiveImageField(null)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full rounded-3xl bg-card-background p-5"
          >
            <Text className="text-lg font-semibold text-text-primary">
              Anexar imagem
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Escolha de onde deseja enviar.
            </Text>
            <View className="mt-4 gap-3">
              <Pressable
                onPress={async () => {
                  if (!activeImageField) return;
                  const permission =
                    await ImagePicker.requestCameraPermissionsAsync();
                  if (!permission.granted) {
                    setActiveImageField(null);
                    return;
                  }
                  const result = await ImagePicker.launchCameraAsync({
                    quality: 0.8,
                    base64: true,
                  });
                  if (!result.canceled && result.assets?.[0]) {
                    const asset = result.assets[0];
                    handleChange(activeImageField, {
                      uri: asset.uri,
                      base64: asset.base64,
                      type: asset.mimeType,
                      name: asset.fileName,
                    });
                  }
                  setActiveImageField(null);
                }}
                className="rounded-2xl border border-divider px-4 py-3"
              >
                <Text className="text-base text-text-primary">
                  Tirar foto
                </Text>
                <Text className="text-xs text-text-tertiary">
                  Usar a camera do dispositivo.
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!activeImageField) return;
                  const permission =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!permission.granted) {
                    setActiveImageField(null);
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                    base64: true,
                  });
                  if (!result.canceled && result.assets?.[0]) {
                    const asset = result.assets[0];
                    handleChange(activeImageField, {
                      uri: asset.uri,
                      base64: asset.base64,
                      type: asset.mimeType,
                      name: asset.fileName,
                    });
                  }
                  setActiveImageField(null);
                }}
                className="rounded-2xl border border-divider px-4 py-3"
              >
                <Text className="text-base text-text-primary">
                  Escolher da galeria
                </Text>
                <Text className="text-xs text-text-tertiary">
                  Selecionar uma imagem existente.
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
