export function buildUsername(firstName: string, lastName: string, document: string): string {
  if (!firstName || !lastName || !document || document.length < 4) {
    return "";
  }

  const firstLetter = firstName.trim().charAt(0).toLowerCase();
  const cleanLastName = lastName.trim().toLowerCase();
  const lastFourDigits = document.slice(-4);

  return (firstLetter + cleanLastName + lastFourDigits)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
}
