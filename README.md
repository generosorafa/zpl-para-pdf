# Conversor ZPL para PDF

Site responsivo para receber arquivos `.zpl` e `.txt`, combinar até 50 etiquetas e gerar um PDF em tamanho real ou organizado em folha A4.

## Recursos

- Upload por seleção ou arrastar e soltar.
- Vários arquivos no mesmo PDF.
- Campo para colar ZPL manualmente.
- Tamanhos predefinidos e personalizados.
- Resoluções de 152, 203, 300 e 600 DPI.
- Saída em tamanho real ou A4 com layout automático.
- Validação no navegador e no servidor.
- Limite de 900 KB e 50 etiquetas por conversão.
- Cabeçalhos básicos de segurança e respostas sem cache.
- Interface responsiva e acessível.
- Conteúdo educativo, comparação de formatos e perguntas frequentes.
- Política de Privacidade e Termos de Uso.
- Rodapé informativo sem dados pessoais ou canais de contato.

## Como executar localmente

Requisitos: Node.js 20 ou superior.

```bash
npm run dev
```

Acesse `http://localhost:3000`.

> A conversão depende de acesso à internet porque o servidor encaminha o ZPL para o motor externo de renderização.

## Publicação gratuita na Vercel

1. Crie um repositório no GitHub e envie estes arquivos.
2. Importe o repositório na Vercel.
3. Não é necessário configurar comando de build.
4. Publique o projeto.

A pasta `public` contém o site e `api/convert.js` contém a função serverless.

## Privacidade

O site não grava arquivos em banco de dados nem em disco. A primeira versão usa a API externa da Labelary para renderização. No plano gratuito da Labelary, a política informada pelo fornecedor admite retenção máxima de dados de até 60 dias. Por isso, a interface exige uma confirmação antes do envio.

Para uma operação com requisitos mais rigorosos de LGPD, avalie:

- plano da API com compromisso de não retenção;
- instalação on-premises do motor de renderização;
- outro renderizador totalmente local após testes de compatibilidade com as etiquetas utilizadas.

## Variáveis opcionais

```env
LABELARY_BASE_URL=https://api.labelary.com
LABELARY_API_KEY=
```

A chave só é necessária em planos pagos ou endpoints privados.

## Testes

```bash
npm test
```


## Antes da publicação

- Substitua `https://SEU-DOMINIO.com.br` em `public/robots.txt` e `public/sitemap.xml` pelo domínio definitivo.
- Revise os textos legais com um profissional quando a ferramenta começar a receber tráfego relevante ou coletar novos dados.
