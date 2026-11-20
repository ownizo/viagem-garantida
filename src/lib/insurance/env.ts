/** Lê variáveis de ambiente em runtime (Netlify Functions) com fallback para o build. */
export function env(name: string): string | undefined {
    const fromProcess = typeof process !== 'undefined' ? process.env?.[name] : undefined;
    const value = fromProcess ?? (import.meta.env as Record<string, string | undefined>)[name];
    return value && value.trim() !== '' ? value.trim() : undefined;
}
