// Generate a short, human-friendly ticket ID
// Format: TKT-XXXX-XXXX (alphanumeric, no ambiguous chars)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateTicketId(): string {
  const block = (n: number) =>
    Array.from({ length: n }, () =>
      ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    ).join("");
  return `TKT-${block(4)}-${block(4)}`;
}

export function ticketUrl(ticketId: string): string {
  if (typeof window === "undefined") return `/ticket/${ticketId}`;
  return `${window.location.origin}/ticket/${ticketId}`;
}
