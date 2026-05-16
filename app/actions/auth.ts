'use server'

/**
 * Verifica si la contraseña proporcionada coincide con ADMIN_PASSWORD.
 * Retorna true si es válida, false si no.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD no está configurado en las variables de entorno");
  }

  return password === adminPassword;
}

/**
 * Guard de autenticación para server actions de admin.
 * Lanza un error si la contraseña es incorrecta o no está configurada.
 */
export async function assertAdmin(password: string): Promise<void> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    throw new Error("No autorizado: contraseña de admin incorrecta");
  }
}
