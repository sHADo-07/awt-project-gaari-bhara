/** Small cleaners for DTO fields. Use them with @Transform(({ value }) => trim(value)). */

export const trim = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;

export const lowerTrim = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

/** +8801712345678, 8801712345678 and 01712-345678 all become 01712345678. */
export const normalizePhone = (value: unknown) => {
  if (typeof value !== "string") return value;
  const digits = value.replace(/[\s-]/g, "");
  if (digits.startsWith("+880")) return "0" + digits.slice(4);
  if (digits.startsWith("880")) return "0" + digits.slice(3);
  return digits;
};
