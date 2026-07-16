# Marcos Despachante

Site institucional do Marcos Despachante, escritório especializado em documentação veicular em Lages/SC.

> O escritório que poupa o seu tempo!

## Site publicado

[www.marcosdespachante.com.br](https://www.marcosdespachante.com.br/)

## Recursos

- Apresentação dos serviços oferecidos;
- Atendimento contextualizado pelo WhatsApp;
- Localização e horário de atendimento;
- Formulário de orçamento integrado ao Formspree;
- Avaliações reais carregadas dinamicamente do Google Maps;
- Política de Privacidade e Termos de Uso;
- Layout responsivo e navegação acessível;
- Metadados sociais, dados estruturados e sitemap;
- Imagens WebP com fallback para os formatos originais.

## Tecnologias

- HTML5;
- CSS3;
- JavaScript;
- GitHub Pages;
- Google Maps JavaScript API e Places API (New) para avaliações;
- Formspree para o envio do formulário.

## Estrutura principal

```text
.
├── imagens/
├── 404.html
├── CNAME
├── index.html
├── privacidade.html
├── termos-de-uso.html
├── robots.txt
├── script.js
├── sitemap.xml
└── styles.css
```

## Execução local

O projeto é estático e não exige instalação de dependências. Na pasta do projeto, execute:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador. Também é possível usar a extensão Live Server do Visual Studio Code.

## Publicação

A publicação ocorre pelo GitHub Pages a partir do branch `main`. O domínio personalizado é definido pelo arquivo `CNAME`.

Após mudanças relevantes de conteúdo:

1. Confirme o funcionamento local;
2. Verifique os links, o formulário e a navegação móvel;
3. Atualize a data das páginas modificadas no `sitemap.xml`;
4. Publique no branch `main`;
5. Confirme a versão no domínio público.

## SEO e indexação

- `robots.txt` permite o rastreamento e informa o endereço do sitemap;
- `sitemap.xml` lista as páginas públicas que devem ser indexadas;
- `404.html` orienta o visitante quando uma rota não existe;
- A página principal contém Open Graph, Twitter Card e dados estruturados `LocalBusiness`.

O sitemap deve ser cadastrado no Google Search Console:

```text
https://www.marcosdespachante.com.br/sitemap.xml
```

## Validação automática

O projeto possui verificações locais e um workflow do GitHub Actions para validar HTML, links internos e métricas do Lighthouse.

Instale as dependências:

```bash
npm ci
```

Execute todas as verificações:

```bash
npm run validate
```

Também é possível executar cada etapa separadamente:

```bash
npm run validate:html
npm run validate:links
npm run validate:lighthouse
```

Os limites mínimos do Lighthouse são: desempenho 75, acessibilidade 90, boas práticas 85 e SEO 90. Os relatórios gerados pela automação ficam disponíveis como artefatos da execução no GitHub por 14 dias.

## Privacidade

O formulário envia os dados informados ao Formspree. As finalidades, o prazo de retenção, os direitos dos titulares e os serviços externos utilizados estão descritos em [privacidade.html](privacidade.html). As condições de uso e as regras aplicáveis ao conteúdo do Google Maps estão em [termos-de-uso.html](termos-de-uso.html).

## Avaliações do Google

A página principal solicita as avaliações do estabelecimento diretamente à Places API quando a seção se aproxima da área visível. Os dados são exibidos de forma transitória, sem cache ou cópia permanente no site, e permanecem vinculados ao autor e à avaliação original no Google Maps.

A chave usada no navegador deve permanecer protegida no Google Cloud com restrições de referenciador HTTP para os domínios publicados e restrições somente às APIs necessárias. O Place ID utilizado é `ChIJ8zI32D0f4JQRiuik9OeR3O0`.

## Direitos

© 2019–2026 Marcos Despachante. Todos os direitos reservados.
