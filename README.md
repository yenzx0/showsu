# ShowSu Delícias — Vue + Vite

Nova versão do site da ShowSu, reconstruída em Vue 3 com Vite.

## Rodar o projeto

Requisitos: Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos prontos serão criados na pasta `dist`.

## Painel local

No rodapé do site, clique em **Painel local** para abrir o gerenciador do catálogo.
Nele é possível:

- criar e excluir categorias;
- adicionar produtos e fotos;
- editar, ocultar ou excluir produtos;
- exportar e importar um backup completo do catálogo.

Os cadastros ficam armazenados somente no navegador do computador usado. Para levar
os dados a outro computador ou proteger o catálogo contra limpeza do navegador,
use **Exportar backup** e guarde o arquivo `.json`.

## Onde editar

- `src/data/products.js`: catálogo original usado na primeira abertura ou restauração.
- `src/data/site.js`: telefones, WhatsApp, Instagram e navegação.
- `src/components`: cada parte visual do site.
- `src/assets/styles/global.css`: paleta, tipografia e responsividade.
- `public/images`: imagens usadas pelo site.

## Preparação para IA

O arquivo `src/services/orderAssistant.js` funciona como uma camada de integração.
No futuro, um provedor de IA pode receber a pergunta do cliente e o catálogo sem
que os componentes ou os dados precisem ser reestruturados.

Nunca coloque uma chave de API diretamente no navegador. A integração real deve
usar um servidor ou função segura, com variáveis de ambiente.
