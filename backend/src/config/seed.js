const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const User = require('../models/User');
const WasteReport = require('../models/WasteReport');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const Leaderboard = require('../models/Leaderboard');
const Reward = require('../models/Reward');

const sampleUsers = [
  {
    username: 'ops_admin',
    email: 'admin@trashcontrol.in',
    password: 'password123',
    role: 'admin',
    impactScore: 500
  },
  {
    username: 'arjun_nair',
    email: 'arjun.nair@example.in',
    password: 'password123',
    role: 'user',
    impactScore: 180
  },
  {
    username: 'kavya_iyer',
    email: 'kavya.iyer@example.in',
    password: 'password123',
    role: 'user',
    impactScore: 250
  }
];

const seedDatabase = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_waste_db';
    console.log(`Connecting to database for seeding: ${connStr}`);
    await mongoose.connect(connStr);

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await WasteReport.deleteMany({});
    await Notification.deleteMany({});
    await Achievement.deleteMany({});
    await Leaderboard.deleteMany({});
    await Reward.deleteMany({});

    console.log('Seeding Users...');
    const createdUsers = await User.create(sampleUsers);
    
    const adminUser = createdUsers[0];
    const johnUser = createdUsers[1];
    const janeUser = createdUsers[2];

    console.log('Seeding Waste Reports...');
    const reports = [
      {
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139], // New Delhi
          address: 'Janpath Road, Connaught Place, New Delhi'
        },
        wasteType: 'Plastic',
        description: 'Large pile of plastic bottles collected beside a busy market entrance.',
        status: 'approved',
        photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1580974719/plastic-pile.jpg',
        userId: johnUser._id,
        assignedTeam: 'NDMC Green Response Team'
      },
      {
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760], // Mumbai
          address: 'Dadar West Market Road, Mumbai'
        },
        wasteType: 'Hazardous',
        description: 'Discarded batteries, chargers, and aerosol cans near a residential lane.',
        status: 'pending',
        photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1580974719/batteries.jpg',
        userId: janeUser._id
      },
      {
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bengaluru
          address: '12th Main Road, Indiranagar, Bengaluru'
        },
        wasteType: 'Organic',
        description: 'Fallen fruit and vegetable waste decomposing near a public sidewalk.',
        status: 'resolved',
        photoUrl: '',
        userId: janeUser._id,
        assignedTeam: 'BBMP Composting Team'
      },
      {
        location: { type: 'Point', coordinates: [72.8258, 18.9894], address: 'Bandra East, Mumbai' },
        wasteType: 'Organic',
        description: 'Vegetable market waste accumulating near a collection point.',
        status: 'resolved',
        photoUrl: '',
        userId: johnUser._id,
        assignedTeam: 'Mumbai Compost Response Team'
      },
      {
        location: { type: 'Point', coordinates: [77.6412, 12.9719], address: 'Indiranagar, Bengaluru' },
        wasteType: 'E-waste',
        description: 'Old chargers and discarded electronics left beside a commercial lane.',
        status: 'approved',
        photoUrl: '',
        userId: janeUser._id,
        assignedTeam: 'Bengaluru E-Waste Cell'
      },
      {
        location: { type: 'Point', coordinates: [77.5726, 12.9352], address: 'Jayanagar, Bengaluru' },
        wasteType: 'Plastic',
        description: 'Single-use packaging scattered around a bus stop after evening traffic.',
        status: 'pending',
        photoUrl: '',
        userId: johnUser._id
      },
      {
        location: { type: 'Point', coordinates: [91.2868, 23.8315], address: 'Maharajganj Market, Agartala, Tripura' },
        wasteType: 'Plastic',
        description: 'Mixed plastic packaging collected near the market entrance.',
        status: 'pending',
        photoUrl: '',
        userId: janeUser._id
      },
      {
        location: { type: 'Point', coordinates: [91.2730, 23.8315], address: 'Gandhighat, Agartala, Tripura' },
        wasteType: 'Organic',
        description: 'Leaf litter and food waste requiring scheduled compost pickup.',
        status: 'resolved',
        photoUrl: '',
        userId: johnUser._id,
        assignedTeam: 'Agartala Green City Team'
      },
      {
        location: { type: 'Point', coordinates: [91.2860, 23.8500], address: 'Battala, Agartala, Tripura' },
        wasteType: 'Metal',
        description: 'Small metal scrap pile beside a public service lane.',
        status: 'approved',
        photoUrl: '',
        userId: janeUser._id,
        assignedTeam: 'Tripura Municipal Recovery Team'
      }
    ];
    await WasteReport.create(reports);

    console.log('Seeding Achievements...');
    const achievements = [
      {
        userId: johnUser._id,
        title: 'Eco Beginner',
        description: 'Reported your first waste pile to help clean the planet!',
        badgeUrl: 'https://res.cloudinary.com/demo/image/upload/v1580974719/eco-beginner.png'
      },
      {
        userId: janeUser._id,
        title: 'Eco Beginner',
        description: 'Reported your first waste pile to help clean the planet!',
        badgeUrl: 'https://res.cloudinary.com/demo/image/upload/v1580974719/eco-beginner.png'
      },
      {
        userId: janeUser._id,
        title: 'Eco Champion',
        description: 'Earned 100+ impact points by resolving waste piles!',
        badgeUrl: 'https://res.cloudinary.com/demo/image/upload/v1580974719/eco-champion.png'
      }
    ];
    await Achievement.create(achievements);

    console.log('Seeding Notifications...');
    const notifications = [
      {
        userId: johnUser._id,
        message: 'Your waste report for Plastic has been approved.',
        read: true,
        type: 'report_status'
      },
      {
        userId: janeUser._id,
        message: 'Achievement Unlocked: Eco Champion!',
        read: false,
        type: 'achievement'
      }
    ];
    await Notification.create(notifications);

    console.log('Seeding Leaderboard cached standings...');
    const standings = [
      {
        userId: adminUser._id,
        username: adminUser.username,
        impactScore: adminUser.impactScore,
        rank: 1
      },
      {
        userId: janeUser._id,
        username: janeUser.username,
        impactScore: janeUser.impactScore,
        rank: 2
      },
      {
        userId: johnUser._id,
        username: johnUser.username,
        impactScore: johnUser.impactScore,
        rank: 3
      }
    ];
    await Leaderboard.create(standings);

    console.log('Seeding Marketplace Rewards...');
    const rewards = [
      {
        title: 'Reusable Chai Cup Voucher',
        description: 'Redeem at participating Indian cafes for a reusable cup and a sustainable beverage.',
        pointsCost: 50,
        code: 'ECOCHAI50',
        stock: 50
      },
      {
        title: 'Plant a Native Neem Tree',
        description: 'Sponsor the planting of a native neem tree through a local urban forestry partner.',
        pointsCost: 100,
        code: 'NEEMTREE100',
        stock: 100
      },
      {
        title: '₹500 Zero-Waste Store Coupon',
        description: 'Redeem for sustainable household products at participating Indian package-free stores.',
        pointsCost: 200,
        code: 'ZEROWASTE500',
        stock: 20
      }
    ];
    await Reward.create(rewards);

    console.log('Database successfully seeded!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

// Run if direct execution
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
