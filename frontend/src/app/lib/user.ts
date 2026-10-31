// Email akun yang sedang login (dibaca dari localStorage "user").
// Dipakai untuk memisahkan progress belajar per akun.
export function getUserEmail(): string {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return (u.email || "guest").toLowerCase();
  } catch {
    return "guest";
  }
}
