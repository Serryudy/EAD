// Quick check: What's in the database?
async function checkServices() {
  try {
    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    
    // Get services with different queries
    console.log('\n1️⃣ GET /api/services (default)');
    let res = await fetch('http://localhost:5000/api/services');
    let data = await res.json();
    console.log('   Result:', data);
    
    console.log('\n2️⃣ GET /api/services?isActive=true');
    res = await fetch('http://localhost:5000/api/services?isActive=true');
    data = await res.json();
    console.log('   Result:', data);
    
    console.log('\n3️⃣ GET /api/services?limit=100 (what frontend uses)');
    res = await fetch('http://localhost:5000/api/services?limit=100');
    data = await res.json();
    console.log('   Total in response:', data.pagination.total);
    console.log('   Data array length:', data.data.length);
    if (data.data.length > 0) {
      console.log('   First service:', data.data[0].name, '- Active:', data.data[0].isActive);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkServices();
