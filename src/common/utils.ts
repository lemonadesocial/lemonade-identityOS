export function alphabeticalValue(value: string) {
  return Array.from(value.toLowerCase())
    .map((char) => char.charCodeAt(0))
    .join("");
}
