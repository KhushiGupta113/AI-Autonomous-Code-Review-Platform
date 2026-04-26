FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Run vite with --host to allow external access within Docker network
CMD ["npm", "run", "dev", "--", "--host"]
