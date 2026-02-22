const mongoose = require('mongoose');
const Asset = require('./src/models/Asset');
require('dotenv').config();

const seedAssets = [
    {
        name: "Reliance Industries (RELIANCE)",
        type: "STOCK",
        price: 2950.45,
        quantity: 50,
        priceHistory: [
            { date: "2024-01-01", price: 2800 },
            { date: "2024-01-02", price: 2820 },
            { date: "2024-01-03", price: 2810 },
            { date: "2024-01-04", price: 2850 },
            { date: "2024-01-05", price: 2840 },
            { date: "2024-01-06", price: 2860 },
            { date: "2024-01-07", price: 2880 },
            { date: "2024-01-08", price: 2920 },
            { date: "2024-01-09", price: 2950.45 },
        ]
    },
    {
        name: "NIFTY 50 Future",
        type: "FUTURE",
        price: 22500,
        quantity: 2,
        leverage: 10,
        priceHistory: [
            { date: "2024-01-01", price: 21500 },
            { date: "2024-01-02", price: 21700 },
            { date: "2024-01-03", price: 21400 },
            { date: "2024-01-04", price: 21600 },
            { date: "2024-01-05", price: 21800 },
            { date: "2024-01-06", price: 22000 },
            { date: "2024-01-07", price: 22200 },
            { date: "2024-01-08", price: 22400 },
            { date: "2024-01-09", price: 22500 },
        ]
    }
];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Seeding data...');
        await Asset.deleteMany({});
        await Asset.insertMany(seedAssets);
        console.log('Data seeded successfully');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
