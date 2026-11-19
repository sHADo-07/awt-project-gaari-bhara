export const trim = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;

export const lowerTrim = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

export const normalizePhone = (value: unknown) => {
  if (typeof value !== "string") return value;
  const digits = value.replace(/[\s-]/g, "");
  if (digits.startsWith("+880")) return "0" + digits.slice(4);
  if (digits.startsWith("880")) return "0" + digits.slice(3);
  return digits;
};
