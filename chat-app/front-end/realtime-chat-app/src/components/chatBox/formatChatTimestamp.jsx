export default function formatChatTimestamp(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  // Remove time for clean date comparison
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = d2 - d1; // difference in ms
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // Today → show time
  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  // Yesterday → show "Yesterday"
  if (diffDays === 1) {
    const yesterday = "Yesterday";
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${yesterday} at ${time}`;
  }

  // Future (very rare)
  if (diffDays === -1) {
    return "Tomorrow";
  }

  // Older messages → show date
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
