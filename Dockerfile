FROM node:18.16.0-bullseye-slim as builder

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app/
RUN npx prisma generate
RUN npm run build

FROM node:18.16.0-bullseye-slim
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/remix.config.js /app/
COPY --from=builder /app/remix.env.d.ts /app/
COPY --from=builder /app/tsconfig.json /app/
CMD ["npm","run", "start"]