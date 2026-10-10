// test-rapidapi.js
// Utility script to verify RapidAPI Zillow API connection
require('dotenv').config();
const { searchSaleProperties } = require('./services/rapidApiService');

async function testConnection() {
  console.log('========================================================');
  console.log('  ArcConsult RapidAPI Zillow Connection Verification    ');
  console.log('========================================================\n');

  console.log(`RAPIDAPI_HOST: ${process.env.RAPIDAPI_HOST || 'Not set'}`);
  console.log(`RAPIDAPI_KEY:  ${process.env.RAPIDAPI_KEY ? `${process.env.RAPIDAPI_KEY.slice(0, 10)}...${process.env.RAPIDAPI_KEY.slice(-4)}` : 'Not set'}\n`);

  console.log('Querying: location="new york", property_types="house", page=1...');
  const result = await searchSaleProperties({
    location: 'new york',
    propertyTypes: 'house',
    page: 1,
    doz: 7
  });

  if (result.success) {
    console.log('\n[SUCCESS] RapidAPI connection established!');
    console.log(`Retrieved ${result.count} properties.`);
    if (result.properties.length > 0) {
      console.log('First property sample:');
      console.log(JSON.stringify(result.properties[0], null, 2));
    }
  } else {
    console.log('\n[STATUS]:', result.status || 'Error');
    console.log('[MESSAGE]:', result.message || result.error);
    if (result.requiresSubscriptionAction) {
      console.log('\n--------------------------------------------------------');
      console.log('ACTION REQUIRED: Activate RapidAPI Free Subscription');
      console.log('--------------------------------------------------------');
      console.log('RapidAPI requires you to click "Subscribe to Test" on');
      console.log('the API homepage once to bind your key to this API.\n');
      console.log('1. Open: https://rapidapi.com/realestateapi-realestateapi-default/api/real-estate-zillow-com');
      console.log('2. Log in with your RapidAPI account.');
      console.log('3. Click "Subscribe to Test" or select the "Basic (Free)" plan.');
      console.log('4. Re-run this command: npm run test:rapidapi');
      console.log('--------------------------------------------------------');
    }
  }
}

testConnection();
