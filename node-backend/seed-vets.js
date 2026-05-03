const mongoose = require('mongoose');
const Vet = require('./src/models/Vet');
require('dotenv').config();

const seedVets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/petguardian');
    
    // Clear existing vets to avoid duplicates for testing
    // await Vet.deleteMany({});

    const mockVets = [
      {
        name: "Dr. Kamal Perera",
        clinicName: "Colombo Pet Hospital",
        email: "kamal@example.com",
        phone: "0112345678",
        specialization: ["Surgery", "Vaccination"],
        address: "123 Galle Road, Colombo 03",
        location: {
          type: "Point",
          coordinates: [79.8510, 6.9147] // [lng, lat] - Colombo
        },
        isEmergency: true,
        rating: 4.8,
        isAvailable: true
      },
      {
        name: "Dr. Nilanthi Silva",
        clinicName: "Kandy Vet Care",
        email: "nilanthi@example.com",
        phone: "0812345678",
        specialization: ["General Checkup", "Dentistry"],
        address: "45 Peradeniya Road, Kandy",
        location: {
          type: "Point",
          coordinates: [80.6337, 7.2906] // Kandy
        },
        isEmergency: false,
        rating: 4.5,
        isAvailable: true
      },
      {
        name: "Dr. Saman Kumara",
        clinicName: "Galle Animal Clinic",
        email: "saman@example.com",
        phone: "0912345678",
        specialization: ["Emergency", "Exotic Pets"],
        address: "88 Matara Road, Galle",
        location: {
          type: "Point",
          coordinates: [80.2210, 6.0535] // Galle
        },
        isEmergency: true,
        rating: 4.9,
        isAvailable: true
      }
    ];

    for (const v of mockVets) {
      const exists = await Vet.findOne({ clinicName: v.clinicName });
      if (!exists) {
        await Vet.create(v);
        console.log(`Seeded: ${v.clinicName}`);
      }
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedVets();
