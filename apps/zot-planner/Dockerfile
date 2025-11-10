FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .
RUN npm run build

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "start"]
