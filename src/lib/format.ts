export function formatDateFr(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
