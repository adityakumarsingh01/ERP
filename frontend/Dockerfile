FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Start development server and expose to network
CMD ["npm", "run", "dev", "--", "--host"]
