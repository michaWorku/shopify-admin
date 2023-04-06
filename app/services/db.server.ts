import { PrismaClient } from "@prisma/client";

let db: PrismaClient;
declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
  });
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({ 
      // log: ['query', 'info', 'warn', 'error'], 
    });
  }
  db = global.__db;
}
db.$on("query" as any, (e:any) => {
  // console.log('Query: ' + e.query)
  // console.log('Params: ' + e.params)
  // console.log('Duration: ' + e.duration + 'ms')
})
export { db };