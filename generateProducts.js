// generateProducts.js
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const products = [];
for (let i = 1; i <= 10000; i++) {
  products.push({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 2000, dec: 2 })),
    imageUrl: `https://picsum.photos/seed/${faker.lorem.word()}${i}/400/300`, // More varied seeds
    category: faker.commerce.department()
  });
}

// Load existing users if db.json exists and has users
let existingData = { users: [], products: [] };
try {
  const rawData = fs.readFileSync('db.json');
  existingData = JSON.parse(rawData);
} catch (error) {
  console.log("No existing db.json or it's empty/invalid. Starting fresh for products.");
}


fs.writeFileSync('db.json', JSON.stringify({ users: existingData.users || [], products: products }, null, 2));
console.log('10,000 products generated and added to db.json');