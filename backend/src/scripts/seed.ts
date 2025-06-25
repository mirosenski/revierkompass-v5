import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@revierkompass.de' },
      update: {},
      create: {
        email: 'admin@revierkompass.de',
        password: adminPassword,
        role: 'admin',
        isActive: true,
      },
    });

    console.log(`✅ Admin user created: ${admin.email}`);

    // 2. Create demo user
    console.log('👤 Creating demo user...');
    const userPassword = await bcrypt.hash('demo123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'demo@revierkompass.de' },
      update: {},
      create: {
        email: 'demo@revierkompass.de',
        password: userPassword,
        role: 'user',
        isActive: true,
      },
    });

    console.log(`✅ Demo user created: ${user.email}`);

    // 3. Import police stations from JSON
    console.log('🏢 Importing police stations...');
    
    const stationsPath = path.join(__dirname, '../../../public/data/polizeistationen.json');
    
    if (fs.existsSync(stationsPath)) {
      const stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
      
      console.log(`📄 Found ${stationsData.length} stations to import`);

      // Clear existing stations
      await prisma.policeStation.deleteMany({});
      console.log('🗑️ Cleared existing stations');

      // Import stations
      const importPromises = stationsData.map(async (station: any) => {
        try {
          return await prisma.policeStation.create({
            data: {
              name: station.name,
              address: station.address,
              city: station.city,
              zipCode: station.zipCode || '70000', // Default if missing
              coordinates: {
                lat: station.coordinates.lat,
                lng: station.coordinates.lng,
              },
              type: station.type === 'Präsidium' ? 'präsidium' : 'revier',
              phone: station.phone || null,
              email: station.email || null,
              openingHours: station.openingHours || null,
              isEmergency: station.emergency24h || false,
              isActive: true,
            },
          });
        } catch (error) {
          console.warn(`⚠️ Failed to import station: ${station.name}`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(importPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
      const failed = results.length - successful;

      console.log(`✅ Successfully imported ${successful} stations`);
      if (failed > 0) {
        console.log(`⚠️ Failed to import ${failed} stations`);
      }
    } else {
      console.log('⚠️ Police stations JSON file not found, skipping import');
    }

    // 4. Create demo custom addresses
    console.log('🏠 Creating demo custom addresses...');
    
    const demoAddresses = [
      {
        name: 'Hauptbahnhof Stuttgart',
        street: 'Arnulf-Klett-Platz 2',
        zipCode: '70173',
        city: 'Stuttgart',
        coordinates: { lat: 48.7838, lng: 9.1829 },
      },
      {
        name: 'Flughafen Stuttgart',
        street: 'Flughafenstraße 43',
        zipCode: '70629',
        city: 'Stuttgart',
        coordinates: { lat: 48.6898, lng: 9.2218 },
      },
      {
        name: 'Messe Stuttgart',
        street: 'Messepiazza 1',
        zipCode: '70629',
        city: 'Stuttgart',
        coordinates: { lat: 48.6886, lng: 9.2279 },
      },
    ];

    for (const address of demoAddresses) {
      await prisma.customAddress.upsert({
        where: { 
          id: `demo-${address.name.toLowerCase().replace(/\s+/g, '-')}` 
        },
        update: {},
        create: {
          ...address,
          id: `demo-${address.name.toLowerCase().replace(/\s+/g, '-')}`,
          userId: user.id,
          isVerified: true,
        },
      });
    }

    console.log(`✅ Created ${demoAddresses.length} demo addresses`);

    // 5. Display summary
    const [stationCount, userCount, addressCount] = await Promise.all([
      prisma.policeStation.count(),
      prisma.user.count(),
      prisma.customAddress.count(),
    ]);

    console.log('\n📊 Database seeding complete!');
    console.log('═══════════════════════════════════');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏢 Police Stations: ${stationCount}`);
    console.log(`🏠 Custom Addresses: ${addressCount}`);
    console.log('═══════════════════════════════════');
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin@revierkompass.de / admin123');
    console.log('User:  demo@revierkompass.de / demo123');
    console.log('\n🚀 Ready to start the backend server!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
