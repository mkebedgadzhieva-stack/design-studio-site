// Имя пользователя для интерфейса кабинета.
// Регистрация по e-mail кладёт в user_metadata display_name / first_name / last_name
// (TwoStepSignup), вход через Google — full_name / name. Иначе — e-mail.
export function getDisplayName(user) {
  const meta = user?.user_metadata || {};
  const fromParts = [meta.first_name, meta.last_name]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");

  const candidates = [meta.display_name, meta.full_name, meta.name, fromParts, user?.email];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

export function getInitial(name) {
  const first = Array.from(name || "").find((ch) => /\p{L}|\p{N}/u.test(ch));
  return first ? first.toLocaleUpperCase("ru-RU") : "•";
}
