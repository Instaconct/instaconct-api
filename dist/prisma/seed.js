"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
async function main() {
    const organization = await prisma.organization.create({
        data: {
            name: faker_1.faker.company.name(),
        },
    });
    const usersData = Array.from({ length: 50 }).map(() => ({
        name: faker_1.faker.person.fullName(),
        email: faker_1.faker.internet.email(),
        password: faker_1.faker.internet.password(),
        organizationId: organization.id,
        phone: faker_1.faker.phone.number(),
        role: faker_1.faker.helpers.arrayElement(['AGENT', 'MANAGER', 'SUPER_MANAGER']),
        is_verified: faker_1.faker.datatype.boolean(),
    }));
    await prisma.user.createMany({
        data: usersData,
    });
    console.log('✅ Seed data inserted!');
}
main()
    .catch((e) => {
    console.error('Error seeding data: ', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map