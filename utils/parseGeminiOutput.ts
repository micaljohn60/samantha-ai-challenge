// utils/parseGeminiOutput.ts
export function parseGeminiOutput(text: string) {
  const result: Record<string, string> = {};
  const lines = text.split("\n");
  lines.forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      result[key.trim()] = rest.join(":").trim();
    }
  });
  return result;
}
