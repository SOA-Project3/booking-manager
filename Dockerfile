FROM node:16
 
WORKDIR /app
 
COPY package.json package.json
COPY package-lock.json package-lock.json
 
RUN npm install
 
COPY . .
 
EXPOSE 3004


CMD [ "node", "src/index.js" ]
