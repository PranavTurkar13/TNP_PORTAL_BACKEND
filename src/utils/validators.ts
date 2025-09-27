export function isValidPhone(phoneNo: string) {
  return /^[6-9]\d{9}$/.test(phoneNo);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
