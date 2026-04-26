FROM node:18-alpine
# Install git as it's required for cloning repositories
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["npm", "start"]
