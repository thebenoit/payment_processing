# Image de base Node.js
FROM node:18-alpine

# Création et définition du répertoire de travail
WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers du projet
COPY . .

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "index.js"]