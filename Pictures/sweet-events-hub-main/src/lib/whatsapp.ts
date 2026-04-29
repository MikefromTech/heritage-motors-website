export const WHATSAPP_NUMBER = "917888677339";

export function whatsappReserveUrl(eventName: string) {
  const msg = `Hi, I want to book for ${eventName}. Name: ___ Number of tickets: ___`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function whatsappTicketShareUrl(eventName: string, ticketLink: string) {
  const msg = `Hey 👋\n\nYour ticket for ${eventName} is ready 🎟️\n\nShow this at the entrance:\n${ticketLink}`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
