/**
 * Função helper para formatar o nome completo de um usuário
 * a partir de firstName e lastName
 */
export function formatUserName(
  firstName?: string | null,
  lastName?: string | null
): string {
  const parts: string[] = [];
  
  if (firstName && firstName.trim()) {
    parts.push(firstName.trim());
  }
  
  if (lastName && lastName.trim()) {
    parts.push(lastName.trim());
  }
  
  return parts.length > 0 ? parts.join(" ") : "Usuário";
}

/**
 * Função helper para obter o nome completo de um objeto User
 */
export function getUserFullName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string; // Fallback para compatibilidade
}): string {
  if (!user) return "Usuário";
  
  // Se tiver firstName ou lastName, usar esses campos
  if (user.firstName || user.lastName) {
    return formatUserName(user.firstName, user.lastName);
  }
  
  // Fallback para o campo name antigo (compatibilidade)
  if (user.name) {
    return user.name;
  }
  
  return "Usuário";
}

















