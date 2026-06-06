import mysql from 'mysql2/promise';

const pool = mysql.createPool('mysql://root:sunfra@localhost:3306/sunfrafarms');

const firstNames = [
  'Ramesh', 'Suresh', 'Mahesh', 'Ganesh', 'Rajesh', 'Dinesh', 'Naresh', 'Yogesh',
  'Mukesh', 'Rakesh', 'Vikas', 'Anil', 'Sunil', 'Kapil', 'Sachin', 'Rohit', 'Amit',
  'Ajay', 'Vijay', 'Sanjay', 'Ravi', 'Kiran', 'Arjun', 'Mohan', 'Sohan', 'Hari',
  'Shiva', 'Vishnu', 'Prasad', 'Venkat', 'Srikanth', 'Srinivas', 'Praveen', 'Naveen',
  'Sandeep', 'Deepak', 'Manoj', 'Pavan', 'Charan', 'Lokesh', 'Suresh', 'Naidu',
  'Raju', 'Babu', 'Gopal', 'Krishna', 'Murali', 'Ashok', 'Pramod', 'Santosh',
  'Lakshmi', 'Padma', 'Kavya', 'Priya', 'Divya', 'Sneha', 'Pooja', 'Anusha',
  'Swathi', 'Madhavi', 'Radha', 'Sita', 'Geetha', 'Rekha', 'Sunitha', 'Anitha',
  'Savitha', 'Usha', 'Vani', 'Jyothi', 'Nirmala', 'Saritha', 'Lavanya', 'Mounika',
  'Haritha', 'Bhavani', 'Chandrika', 'Revathi', 'Vijaya', 'Kamala', 'Kumari', 'Devi',
  'Narayana', 'Subramanyam', 'Venkateswarlu', 'Hanumaiah', 'Nageswara', 'Satyanarayana',
  'Bhaskar', 'Chandra', 'Kishore', 'Rajendra', 'Sreenivas', 'Mallikarjun', 'Ramakrishna',
  'Brahmaiah', 'Tirupathi', 'Laxman', 'Bharat', 'Satish', 'Girish', 'Harish'
];

const lastNames = [
  'Rao', 'Reddy', 'Naidu', 'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patil',
  'Nair', 'Pillai', 'Iyer', 'Krishnan', 'Varma', 'Murthy', 'Prasad', 'Babu',
  'Goud', 'Yadav', 'Teja', 'Chowdary', 'Raju', 'Swamy', 'Patel', 'Shah', 'Das'
];

const references = [
  'Self', 'Referred by Suresh Rao', 'Referred by Ramesh Reddy', 'Referred by Ganesh Naidu',
  'Referred by Village Head', 'Walk-in', 'Referred by Contractor Babu', 'Newspaper Ad',
  'Referred by Vijay Kumar', 'Referred by previous worker', null, null, null
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomMobile() {
  const prefixes = ['9', '8', '7', '6'];
  const prefix = getRandom(prefixes);
  const rest = Math.floor(Math.random() * 900000000) + 100000000;
  return prefix + rest.toString().slice(0, 9);
}

function randomAadhar() {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 9000 + 1000)).join(' ');
}

async function seedWorkers() {
  try {
    const workers = [];
    const usedNames = new Set();

    while (workers.length < 100) {
      const first = getRandom(firstNames);
      const last = getRandom(lastNames);
      const fullName = `${first} ${last}`;
      if (usedNames.has(fullName)) continue; // avoid duplicates
      usedNames.add(fullName);

      workers.push([
        fullName,
        randomMobile(),
        randomAadhar(),
        getRandom(references) || '',
        Math.random() > 0.15 ? 'active' : 'inactive', // ~85% active
      ]);
    }

    for (const w of workers) {
      await pool.execute(
        'INSERT INTO labour (name, mobile, aadhar, reference, status) VALUES (?, ?, ?, ?, ?)',
        w
      );
    }

    console.log(`✅ Successfully seeded 100 workers!`);
    const [rows] = await pool.execute('SELECT status, COUNT(*) as count FROM labour GROUP BY status');
    console.log('Status breakdown:', rows);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seedWorkers();
