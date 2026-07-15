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
- Política de Privacidade;
- Layout responsivo e navegação acessível;
- Metadados sociais, dados estruturados e sitemap;
- Imagens WebP com fallback para os formatos originais.

## Tecnologias

- HTML5;
- CSS3;
- JavaScript;
- GitHub Pages;
- Formspree para o envio do formulário.

## Estrutura principal

```text
.
├── imagens/
├── 404.html
├── CNAME
├── index.html
├── privacidade.html
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

## Privacidade

O formulário envia os dados informados ao Formspree. As finalidades, o prazo de retenção, os direitos dos titulares e os serviços externos utilizados estão descritos em [privacidade.html](privacidade.html).

## Direitos

© 2019–2026 Marcos Despachante. Todos os direitos reservados.
