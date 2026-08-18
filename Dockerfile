FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx vite build && npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
