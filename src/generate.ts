import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client'

export function createRandomUsersData(num=5): Prisma.UserCreateManyInput[] {
    return Array(num).fill(null).map(() => ({
        email: faker.internet.email(),
        name: faker.name.fullName()
    }));
}

export function createRandomProductsData(num=5): Prisma.ProductCreateManyInput[] {
    return Array(num).fill(null).map(
        ()=>(
            {
                title: faker.commerce.productName(),
                price: new Prisma.Decimal(faker.commerce.price()),
            }
        )
    )   
}



