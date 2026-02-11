# Imagem base
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia arquivos de dependência primeiro (melhora cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Builda o TypeScript
RUN npm run build

# Expõe a porta da API
EXPOSE 3333

# Comando para rodar em produção
CMD ["node", "dist/server.js"]
