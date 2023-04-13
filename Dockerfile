FROM node:18-alpine as builder

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app/
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/prisma /app/prisma

CMD ["npm","run", "start"]