import { Prisma, PrismaClient, Product, User } from '@prisma/client'
import { createRandomUsersData, createRandomProductsData } from './generate'
const chalk = require('chalk');

const random = (n: number): number => Math.floor(Math.random() * n) + 1;
const prisma = new PrismaClient({
    errorFormat: 'pretty',
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
})

prisma.$on('query', (e) => {
    console.log('Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
})


// A `main` function so that you can use async/await
async function main() {

    await dropAll()
    await seedProducts()
    await seedUsers();

    /* for every user create orders*/
    await createOrdersForUsers();

    showOrdersForUsers()
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })


async function dropAll() {
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.user.deleteMany()
    await prisma.product.deleteMany()

    console.log(chalk.red("Data truncated"));
}

async function seedProducts(count = 10) {
    const data = createRandomProductsData(10);
    const result = await prisma.product.createMany({ data })
    console.log(chalk.green("products added to db"), { result });
}

async function seedUsers(num = 4) {
    const data = createRandomUsersData(num);
    const result = await prisma.user.createMany({ data });

    console.log(chalk.green("users added to db"), { result });
}

async function getRandomProducts(num = 1) {
    const randomIdList = (await prisma.product.findMany({
        select: { id: true }
    })).map(({ id }: any) => id).sort(() => Math.random() - 0.5)


    const myProducts: Product[] | null = await prisma.product.findMany({ where: { id: { in: randomIdList.slice(0, num) } } })
    return myProducts;
}

async function seedOrderForUser(user: User) {
    //1-3 products per order
    const productList = await getRandomProducts(random(3))

    let order: Prisma.OrderCreateInput = {
        createdAt: new Date(),
        user: { connect: { id: user.id } },
        items: {
            createMany: {
                data: productList?.map(
                    (product) => {
                        const howMany = random(3);
                        return {
                            productId: product.id,
                            count: howMany,
                            price: product.price.mul(howMany)
                        }
                    }
                )
            }
        }
    }

    const result = await prisma.order.create({ data: order });
    console.log(result, order);
}


async function createOrdersForUsers() {
    const userList = await prisma.user.findMany();
    await Promise.all(userList.map(
        (user) => seedOrderForUser(user)
    ));

    console.log(chalk.green("orders created for users"));
}


async function showOrdersForUsers() {
    const userList = await prisma.user.findMany({
        include: {
            orders: {
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        }
    });

    userList.forEach(
        (user) => {
            console.log(chalk.blue(user.name + " ordered:"));
            user.orders?.forEach(
                (order) => {
                    order.items.forEach(
                        (item) => {
                            console.log(`${item.count} X ${item.product.title} = $${item.price}`)
                        }
                    )
                }
            )
            console.log(chalk.magenta("---------------------------"))
        }
    )
}

