# Black November Cursos

Página Passaporte Vitalício importada do ZIP fornecido.

- `src/content/passaporte.html`: documento HTML original.
- `src/routes/index.tsx`: exibe o documento em um iframe, preservando seus estilos e scripts e permitindo a visualização no Lovable.
- `public/mirror/`: estilos, scripts, imagens e fontes do espelho.
- `public/pages/`: páginas adicionais incluídas no arquivo.
- `public/assets/`: ícones e dados estruturados incluídos no arquivo.

As fontes corrompidas/incompletas do espelho foram recuperadas dos endereços originais, preservando as famílias Poppins e Montserrat e os ícones.

A estrutura TanStack Start/Lovable foi preservada. Para desenvolver, execute
`pnpm install` e `pnpm dev`. Para gerar a versão de produção, `pnpm build`.

Os links, integrações e serviços externos continuam apontando para os destinos
presentes no arquivo original e podem depender do site de origem.
