# PrismaJS Typescript node Ecommerce Schema


Full CRUD cycle:
Create users, products orders, orderItems with relations, View all items, Delete

---

Update .env file

Update DATABASE_URL

```bash

cp .env.example .env 

```

Install dependencies and run

```bash

npm i

npx prisma generate

npm run dev

```

This example uses PostgreSQL