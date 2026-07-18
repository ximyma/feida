// Stub for shiki code highlighting
// Satisfies code-block-shiki.tsx imports without shiki dependency
export type BundledLanguage = string;

export const bundledLanguages: string[] = [
  'javascript', 'typescript', 'python', 'java', 'go', 'rust',
  'html', 'css', 'json', 'bash', 'sql', 'c', 'cpp',
];

export async function codeToTokensWithThemes(
  code: string,
  _options: { lang: string; themes: Record<string, any> }
): Promise<{ tokens: any[]; themeName: string }> {
  return { tokens: [], themeName: 'none' };
}
