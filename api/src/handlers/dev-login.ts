// ATENÇÃO: Rota temporária de desenvolvimento. Deve ser removida no futuro antes de ir para produção.
// Usada apenas para obter o ID Token real do Google para testes locais.
export async function handleDevLogin(): Promise<Response> {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const template = await Bun.file(new URL("../dev-login.html", import.meta.url)).text();
  const html = template.replace("__GOOGLE_CLIENT_ID__", clientId);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
