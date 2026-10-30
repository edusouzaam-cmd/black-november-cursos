# Publicação manual — Black Cursos

Projeto: React 19, TanStack Start/Router e Vite 8. Gerenciador: Bun 1.3.11,
lockfile `bun.lock`; instalação reprodutível: `bun install --frozen-lockfile`.
Node usado no Actions: 22.

O Lovable exibe o documento `src/content/passaporte.html` em um iframe para
preservar o CSS e scripts originais. O build KingHost compila o projeto com
Vite (saída `dist/client`) e exporta esse mesmo documento diretamente como
`index.html`, com todos os recursos locais em `/black-cursos/`. Isso mantém o
conteúdo e o visual existentes, dispensando Node/SSR no servidor KingHost.
O build normal e a prévia do Lovable mantêm o funcionamento anterior.

Comandos:
- `bun run build:kinghost`: compila e prepara `kinghost-package/`.
- `bun run validate:kinghost`: valida recursos, fontes, HTML e metadados.

O pacote inclui a página principal, `termos-de-uso.html` e
`politica-de-privacidade.html`, favicon original, `assets/`, `mirror/` com os
recursos de suporte, robots, sitemap e htaccess. As páginas antigas de outros
produtos arquivadas em `public/pages` não fazem parte da publicação.
Scripts de suporte com extensões de cache incomuns ganham cópias `.js` para
servir com o MIME correto. Fallbacks SVG de fontes ausentes são descartados;
as mesmas fontes e ícones WOFF2/WOFF/TTF existentes permanecem no pacote.

## Baixar e publicar

1. GitHub → Actions → **Gerar pacote KingHost** → execução concluída com sucesso
   → Artifacts → **black-cursos-kinghost**.
2. Extraia o ZIP. `index.html` fica diretamente na raiz, sem outra pasta ou ZIP.
3. Envie todo o conteúdo extraído para `black-cursos` dentro da raiz pública do
   domínio `engeteles.com.br` na KingHost. Não envie a pasta `kinghost-package`.
4. Renomeie **htaccess** para **.htaccess** no servidor. O Apache exige o ponto
   inicial para reconhecer as regras. Os arquivos HTML existentes são preservados.
5. Acesse https://engeteles.com.br/black-cursos/ e confira também as duas páginas
   legais por seus links e com atualização direta do navegador.

O robots.txt da subpasta não substitui o robots.txt da raiz do domínio.
Nenhum arquivo de outros sites é alterado. Não há deploy automático nem uso de
credenciais da KingHost. Checkout e integrações externas existentes permanecem
nos respectivos serviços; o pacote contém somente os recursos públicos do site.
