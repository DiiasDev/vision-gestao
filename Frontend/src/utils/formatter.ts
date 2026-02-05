const onlyDigits = (value?: string | null) => {
  if (!value) return "";
  return String(value).replace(/\D+/g, "");
};

export const formatCPF = (value?: string | null) => {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return value ?? "";
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatCNPJ = (value?: string | null) => {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return value ?? "";
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
};

export const formatCPFOrCNPJ = (value?: string | null) => {
  const digits = onlyDigits(value);
  if (digits.length === 11) return formatCPF(digits);
  if (digits.length === 14) return formatCNPJ(digits);
  return value ?? "";
};

export const formatPhoneBR = (value?: string | null) => {
  const digits = onlyDigits(value);
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return value ?? "";
};

export const formatCurrencyBR = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const numeric =
    typeof value === "number"
      ? value
      : (() => {
          const raw = String(value).trim();
          if (!raw) return 0;
          const normalized = raw.includes(",")
            ? raw.replace(/\./g, "").replace(",", ".")
            : raw;
          const parsed = Number(normalized);
          return Number.isFinite(parsed) ? parsed : 0;
        })();
  const safe = Number.isFinite(numeric) ? numeric : 0;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `R$ ${safe.toFixed(2).replace(".", ",")}`;
  }
};

export const formatDateBR = (value?: string | Date | null) => {
  if (!value) return "Sem data";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  try {
    return parsed.toLocaleDateString("pt-BR");
  } catch {
    return parsed.toISOString().split("T")[0];
  }
};

export const formatIdShort = (value?: string | null) => {
  if (!value) return "—";
  return String(value).slice(0, 8);
};
