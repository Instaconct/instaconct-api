// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  //generate fake organization
  const organization = await prisma.organization.create({
    data: {
      name: faker.company.name(),
    },
  });

  // Generate an array of fake user objects
  const usersData = Array.from({ length: 50 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    organizationId: organization.id,
    phone: faker.phone.number(),
    role: faker.helpers.arrayElement(['AGENT', 'MANAGER', 'SUPER_MANAGER']),
    is_verified: faker.datatype.boolean(),
  }));

  // Insert the fake users into the database.
  // Using createMany  for performance; note that createMany may have limitations (like not running hooks).
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
