# Snaption Web Clipper

Uma extensão do Chrome poderosa e intuitiva que permite salvar páginas web diretamente no Notion com apenas um clique, incluindo resumos gerados por inteligência artificial.

## 📋 Visão Geral

O Snaption Web Clipper é uma solução completa que combina uma extensão para Chrome com um backend Django para facilitar a autenticação OAuth com o Notion. A extensão permite que você capture e organize conteúdo da web de forma eficiente, salvando páginas completas, seleções de texto e imagens diretamente em seus bancos de dados do Notion.

## ✨ Principais Funcionalidades

### Salvamento de Conteúdo
- **Páginas Completas**: Salva título, URL, descrição, favicon e conteúdo completo da página
- **Seleções de Texto**: Capture trechos específicos usando o menu de contexto (clique direito)
- **Imagens**: Salve imagens individuais diretamente no Notion
- **Metadados Automáticos**: Extração automática de Open Graph (título, descrição, imagem de capa)

### Organização Inteligente
- **Categorias Personalizáveis**: Organize seu conteúdo com categorias customizadas
- **Sistema de Tags**: Adicione múltiplas tags para facilitar a busca e organização
- **Notas Personalizadas**: Adicione suas próprias observações a qualquer item salvo
- **Ícones Automáticos**: Usa o favicon da página como ícone no Notion

### Inteligência Artificial
- **Resumos Automáticos**: Integração com OpenRouter para gerar resumos inteligentes do conteúdo
- **Modelos Flexíveis**: Suporte para diversos modelos de IA (GPT-3.5-turbo, etc.)
- **Configuração Simples**: Basta inserir sua chave da API OpenRouter

## 🛠️ Arquitetura do Sistema

### Frontend (Extensão Chrome)
A extensão é composta por vários componentes que trabalham em conjunto:

- **Popup Interface**: Interface principal onde o usuário configura databases, categorias e salva páginas
- **Background Service**: Gerencia menus de contexto e operações em segundo plano
- **Content Scripts**: Executa código nas páginas para extrair dados e metadados
- **Sistema de Autenticação**: Fluxo OAuth seguro integrado com o backend Django

### Backend (Django)
O backend funciona como um intermediário seguro para a autenticação OAuth:

- **Endpoint de Login**: Inicia o fluxo OAuth com o Notion
- **Callback Handler**: Processa o retorno da autenticação e fornece o token
- **Configuração Flexível**: Suporte para desenvolvimento local e produção

## 📦 Instalação

### Pré-requisitos
- Python 3.11+
- Node.js (para desenvolvimento)
- Conta no Notion
- Chave da API OpenRouter (opcional, para resumos com IA)

### Configuração do Backend

1. **Clone o repositório:**
```bash
git clone [url-do-repositorio]
cd snaption-web-clipper
```

2. **Configure o ambiente Python:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na pasta `backend/` com:
```env
NOTION_CLIENT_ID=seu_client_id_notion
NOTION_CLIENT_SECRET=seu_client_secret_notion
NOTION_REDIRECT_URI=http://localhost:8000/auth/callback/
EXTENSION_ID=id_da_sua_extensao
```

4. **Execute as migrações e inicie o servidor:**
```bash
python manage.py migrate
python manage.py runserver
```

### Configuração da Extensão

1. **Carregue a extensão no Chrome:**
   - Abra `chrome://extensions/`
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `frontend/`

2. **Configure a integração com o Notion:**
   - Vá para [Notion Integrations](https://www.notion.so/my-integrations)
   - Crie uma nova integração
   - Configure o redirect URI: `http://localhost:8000/auth/callback/`
   - Adicione as credenciais no arquivo `.env`

## 🚀 Como Usar

### Autenticação Inicial
1. Clique no ícone da extensão na barra de ferramentas
2. Clique em "Autenticar com Notion"
3. Autorize a aplicação no Notion
4. Selecione o banco de dados onde deseja salvar o conteúdo

### Salvando Páginas
1. **Página Completa**: Clique no ícone da extensão e depois em "Salvar Página"
2. **Seleção de Texto**: Selecione o texto desejado, clique com o botão direito e escolha "Salvar seleção no Notion como nota"
3. **Imagens**: Clique com o botão direito em uma imagem e escolha "Salvar imagem no Notion"

### Configuração de IA (Opcional)
1. Obtenha uma chave da API no [OpenRouter](https://openrouter.ai)
2. Na extensão, insira sua chave no campo "OpenRouter API Key"
3. A partir de então, resumos automáticos serão gerados para cada página salva

## 🏗️ Estrutura do Projeto

```
snaption-web-clipper/
├── backend/                 # Servidor Django
│   ├── authentication/     # App de autenticação OAuth
│   │   ├── views.py        # Lógica de autenticação
│   │   └── templates/      # Templates HTML
│   ├── backend/            # Configurações principais
│   │   ├── settings.py     # Configurações Django
│   │   └── urls.py         # Roteamento de URLs
│   ├── requirements.txt    # Dependências Python
│   └── Dockerfile          # Container Docker
├── frontend/               # Extensão Chrome
│   ├── manifest.json       # Configuração da extensão
│   ├── popup.html          # Interface principal
│   ├── popup.js            # Lógica da interface
│   ├── background.js       # Service worker
│   ├── auth_complete.html  # Página de callback OAuth
│   └── auth_complete.js    # Lógica do callback
└── .gitignore             # Arquivos ignorados pelo Git
```

## 🔧 Desenvolvimento

### Executando com Docker
```bash
cd backend
docker build -t notion-clipper-backend .
docker run -p 8000:8000 notion-clipper-backend
```

### Testando a Extensão
1. Carregue a extensão no modo desenvolvedor
2. Abra as ferramentas de desenvolvedor do Chrome
3. Vá para a aba "Extensions" para ver logs
4. Use `console.log()` nos scripts para debugging

### Personalizando Campos do Notion
O código está preparado para trabalhar com bancos de dados que tenham as seguintes propriedades:
- **Nome** (título)
- **URL** (URL)
- **Descrição** (texto rico)
- **Categoria** (seleção única)
- **Tags** (seleção múltipla)
- **Notas** (texto rico)
- **Resumo** (texto rico)

Para usar campos diferentes, edite as propriedades em `popup.js` e `background.js`.

## 🔐 Segurança

A aplicação implementa várias medidas de segurança:
- **Tokens de Estado**: Proteção contra ataques CSRF no fluxo OAuth
- **Armazenamento Seguro**: Tokens são armazenados localmente no Chrome
- **HTTPS**: Todo tráfego com APIs externas usa conexões seguras
- **Validação de Entrada**: Sanitização de dados antes do envio para o Notion

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Diretrizes de Desenvolvimento
- Mantenha o código limpo e bem comentado
- Teste todas as funcionalidades antes de submeter
- Siga as convenções de nomenclatura existentes
- Atualize a documentação quando necessário

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Problemas Conhecidos

- **Limitação de Conteúdo**: O texto extraído é limitado a 2000 caracteres para evitar timeouts
- **Favicon**: Alguns sites podem não ter favicons acessíveis
- **Rate Limiting**: APIs externas podem ter limitações de taxa

## 🆘 Suporte

Se você encontrar problemas ou tiver dúvidas:
1. Verifique se todas as dependências estão instaladas corretamente
2. Confirme se as variáveis de ambiente estão configuradas
3. Consulte os logs do console do Chrome para debugging
4. Abra uma issue no repositório do GitHub

## 🔮 Roadmap

Funcionalidades planejadas para versões futuras:
- Suporte para múltiplos bancos de dados
- Interface de configuração mais avançada
- Sincronização offline
- Suporte para outros navegadores
- Integração com mais serviços de IA
