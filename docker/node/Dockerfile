FROM node:20-alpine

# Repertoire de travail
WORKDIR /var/www/front

# Exposition du port Vite
EXPOSE 5173
EXPOSE 3000

# Commande par defaut : serveur de dev Vite
CMD ["sh", "-c", "if [ -f package.json ]; then npm install && npm run dev -- --host 0.0.0.0; else echo 'En attente du projet front...' && tail -f /dev/null; fi"]
