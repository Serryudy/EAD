/**
 * Add sample services via API (uses the server's active connection)
 */

const services = [
  {
    name: 'Oil Change & Filter',
    code: 'OC-001',
    category: 'Maintenance',
    description: 'Full synthetic oil change with filter replacement and multi-point inspection',
    estimatedDuration: 1,
    basePrice: 89.99,
    isActive: true,
    isPopular: true
  },
  {
    name: 'Brake Service',
    code: 'BS-001',
    category: 'Repair',
    description: 'Complete brake system inspection and service including pad replacement',
    estimatedDuration: 2.5,
    basePrice: 249.99,
    isActive: true,
    isPopular: true
  },
  {
    name: 'Tire Rotation',
    code: 'TR-001',
    category: 'Maintenance',
    description: 'Rotate tires to ensure even wear and extend tire life',
    estimatedDuration: 0.5,
    basePrice: 49.99,
    isActive: true,
    isPopular: false
  },
  {
    name: 'Engine Diagnostics',
    code: 'ED-001',
    category: 'Diagnostic',
    description: 'Complete engine diagnostic scan with computer analysis',
    estimatedDuration: 1.5,
    basePrice: 119.99,
    isActive: true,
    isPopular: true
  },
  {
    name: 'AC Recharge',
    code: 'AC-001',
    category: 'Maintenance',
    description: 'Air conditioning system recharge and performance check',
    estimatedDuration: 1,
    basePrice: 149.99,
    isActive: true,
    isPopular: false
  },
  {
    name: 'Battery Replacement',
    code: 'BAT-001',
    category: 'Repair',
    description: 'Replace vehicle battery with new premium battery',
    estimatedDuration: 0.5,
    basePrice: 179.99,
    isActive: true,
    isPopular: false
  },
  {
    name: 'Wheel Alignment',
    code: 'WA-001',
    category: 'Maintenance',
    description: 'Four-wheel alignment to improve handling and tire wear',
    estimatedDuration: 1,
    basePrice: 99.99,
    isActive: true,
    isPopular: true
  },
  {
    name: 'Transmission Service',
    code: 'TS-001',
    category: 'Maintenance',
    description: 'Transmission fluid flush and filter replacement',
    estimatedDuration: 2,
    basePrice: 199.99,
    isActive: true,
    isPopular: false
  },
  {
    name: 'Spark Plug Replacement',
    code: 'SP-001',
    category: 'Maintenance',
    description: 'Replace spark plugs to improve engine performance',
    estimatedDuration: 1,
    basePrice: 129.99,
    isActive: true,
    isPopular: false
  },
  {
    name: 'Coolant Flush',
    code: 'CF-001',
    category: 'Maintenance',
    description: 'Complete coolant system flush and refill',
    estimatedDuration: 1,
    basePrice: 89.99,
    isActive: true,
    isPopular: false
  }
];

async function addServices() {
  console.log('🔄 Adding 10 services via API...\n');
  
  try {
    // Login as admin
    const loginRes = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin@123'
      })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }
    
    console.log('✅ Logged in as admin\n');
    const token = loginData.data.accessToken;
    
    let added = 0;
    let skipped = 0;
    
    // Add each service
    for (const service of services) {
      const res = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(service)
      });
      
      const data = await res.json();
      
      if (data.success) {
        console.log(`✅ Added: ${service.name}`);
        added++;
      } else if (data.message && data.message.includes('already exists')) {
        console.log(`⚠️  Exists: ${service.name}`);
        skipped++;
      } else {
        console.log(`❌ Failed: ${service.name} - ${data.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 SUMMARY:`);
    console.log(`   ✅ Added: ${added} services`);
    console.log(`   ⚠️  Skipped (already exist): ${skipped} services`);
    console.log(`   Total services: ${added + skipped}`);
    console.log('='.repeat(50));
    console.log('\n✨ Refresh your browser to see the services!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addServices();
