

# Usar a imagem base do Node.js
FROM node:18

# Definir o diretório de trabalho no contêiner
WORKDIR /app

# Copiar o package.json e package-lock.json para o contêiner
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o código da aplicação para o contêiner
COPY . .

# Expor a porta que o servidor irá utilizar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]

