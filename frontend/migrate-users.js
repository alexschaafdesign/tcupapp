const fs = require('fs');
const Papa = require('papaparse');
const { ManagementClient } = require('auth0');

// Auth0 configuration
const auth0Config = {
  domain: 'dev-1s71soupcjy6t33y.us.auth0.com',
  clientId: 'zXVssycNbfsN8RKioNc5iwJZcpxOCs2B',
  clientSecret: 'MGT3DMF1wgslNyjMUCRSywT30q-zAqQi3ufdOROQv8UTEORz875p8GSeW3qxb00q'
};

const auth0 = new ManagementClient({
  ...auth0Config,
  audience: `https://${auth0Config.domain}/api/v2/`,
  scope: 'read:users create:users'
});

// Helper function to extract user groups
function getUserGroups(user) {
  const groupMap = {
    '[1] Unregistered / Unconfirmed': 'unregistered',
    '[2] Registered (All Users)': 'registered',
    '[3] Site Admin': 'admin',
    '[4] Moderating': 'moderator',
    '[5] TCUP Members': 'tcup_member',
    '[6] Core Team Leaders': 'core_team'
  };

  const groups = [];
  Object.entries(groupMap).forEach(([key, value]) => {
    if (user[key] && user[key].toString() === '1') {
      groups.push(value);
    }
  });

  return groups;
}

// Sleep function to avoid rate limits
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function migrateUsers(csvFilePath) {
  try {
    console.log('Reading CSV file:', csvFilePath);
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim()
    });

    console.log(`Found ${results.data.length} users to migrate`);
    console.log('Starting migration...\n');

    const successful = [];
    const failed = [];

    for (let i = 0; i < results.data.length; i++) {
      const user = results.data[i];
      const userGroups = getUserGroups(user);
      
      // Progress indicator
      process.stdout.write(`Processing user ${i + 1}/${results.data.length}: ${user.username}...`);

      try {
        const auth0User = {
          email: user.email,
          name: user.username,
          nickname: user.username,
          password: `Auth0-Temp-${Math.random().toString(36).substring(2, 15)}`,
          connection: 'Username-Password-Authentication',
          email_verified: true,
          user_metadata: {
            original_username: user.username,
            register_date: user.register_date,
            last_activity: user.last_activity,
            user_group_id: user.user_group_id,
            groups: userGroups
          },
          app_metadata: {
            source: 'xenforo_migration',
            roles: userGroups
          }
        };

        await auth0.users.create(auth0User);
        successful.push(user.username);
        process.stdout.write(' ✓\n');
        
        // Add a small delay between users
        await sleep(100);
      } catch (error) {
        failed.push({
          username: user.username,
          error: error.message
        });
        process.stdout.write(' ✗\n');
        console.error(`Error details for ${user.username}:`, error.originalError?.response?.data || error.message);
        
        // Longer delay after an error
        await sleep(500);
      }
    }

    // Final summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total users processed: ${results.data.length}`);
    console.log(`Successful migrations: ${successful.length}`);
    console.log(`Failed migrations: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\nFailed migrations:');
      failed.forEach(f => console.log(`- ${f.username}: ${f.error}`));
    }

  } catch (error) {
    console.error('Migration failed:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Usage
migrateUsers('/Users/musicdaddy/Downloads/xenforousers.csv');