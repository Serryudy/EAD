/**
 * Quick fix: Add services directly via the running server's connection
 */

const services = [
  {
    name: 'Oil Change',
    code: 'OC-001',
    category: 'Maintenance',
    description: 'Full synthetic oil change with filter replacement',
    estimatedDuration: 1,
    basePrice: 89.99,
    isActive: true,
    isPopular: true
  },
  {
    name: 'Brake Service',
    code: 'BS-001', 
    category: 'Repair',
    description: 'Complete brake system inspection and service',
    estimatedDuration: 2,
    basePrice: 249.99,
    isActive: true,
    isPopular: true
  },
  {
    name: 'Tire Rotation',
    code: 'TR-001',
    category: 'Maintenance',
    description: 'Rotate tires to ensure even wear',
    estimatedDuration: 0.5,
    basePrice: 49.99,
    isActive: true,
    isPopular: false
  }
];

async function addServices() {
  try {
    console.log('🔄 Adding services via API...\n');
    
    // You need to be logged in as admin first
    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin@123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData.message);
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Logged in as admin');
    const token = loginData.data.accessToken || loginData.token;
    
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
      } else {
        console.log(`❌ Failed: ${service.name} - ${data.message}`);
      }
    }
    
    console.log('\n✅ Done! Refresh your browser to see services');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addServices();
