// services/rapidApiService.js
/**
 * Service for integrating RapidAPI Real Estate (Zillow) API
 */

const RAPIDAPI_BASE_URL = 'https://real-estate-zillow-com.p.rapidapi.com';

/**
 * Fetch properties for sale from RapidAPI Zillow provider
 * @param {Object} options
 * @param {string} options.location - e.g. "new york", "los angeles", etc.
 * @param {string} options.listingTypes - e.g. "agent"
 * @param {string} options.propertyTypes - e.g. "house", "condo"
 * @param {string} options.sort - e.g. "relevant"
 * @param {number} options.page - e.g. 1
 * @param {number} options.doz - days on Zillow, e.g. 7
 * @returns {Promise<Object>}
 */
async function searchSaleProperties({
  location = 'new york',
  listingTypes = 'agent',
  propertyTypes = 'house',
  sort = 'relevant',
  page = 1,
  doz = 7
} = {}) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || 'real-estate-zillow-com.p.rapidapi.com';

  if (!apiKey) {
    return {
      success: false,
      error: 'RAPIDAPI_KEY is not defined in server/.env',
      subscribed: false
    };
  }

  const queryParams = new URLSearchParams({
    location_or_rid: location,
    listing_types: listingTypes,
    property_types: propertyTypes,
    sort,
    page: String(page),
    doz: String(doz)
  });

  const targetUrl = `${RAPIDAPI_BASE_URL}/v1/search/sale?${queryParams.toString().replace(/\+/g, '%20')}`;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey
      }
    });

    const data = await res.json();

    // Check for RapidAPI subscription or quota limitation errors
    if (!res.ok || (data && data.message && data.message.includes('not subscribed'))) {
      return {
        success: false,
        status: res.status,
        message: data.message || 'RapidAPI error',
        subscribed: false,
        requiresSubscriptionAction: true,
        rapidApiUrl: `https://rapidapi.com/realestateapi-realestateapi-default/api/real-estate-zillow-com`,
        instructions: 'Visit the RapidAPI portal for real-estate-zillow-com, click "Subscribe to Test" (or select a Free Plan), and the API key will immediately become active.'
      };
    }

    // Normalize listings if data returned
    const rawListings = data.results || data.data || data.properties || [];
    const normalized = Array.isArray(rawListings)
      ? rawListings.map(normalizeListing).filter(Boolean)
      : [];

    return {
      success: true,
      status: 200,
      subscribed: true,
      count: normalized.length,
      properties: normalized,
      raw: data
    };
  } catch (err) {
    console.error('[RapidAPI Error]:', err.message);
    return {
      success: false,
      error: err.message,
      subscribed: false
    };
  }
}

/**
 * Normalize external Zillow listing format to ArcConsult property schema
 */
function normalizeListing(item) {
  if (!item) return null;

  const price = item.price || item.unformattedPrice || 0;
  const lat = item.latitude || (item.location && item.location.latitude) || (item.latLong && item.latLong.latitude);
  const lng = item.longitude || (item.location && item.location.longitude) || (item.latLong && item.latLong.longitude);

  return {
    id: String(item.zpid || item.id || `ext-${Math.random().toString(36).slice(2, 9)}`),
    title: item.streetAddress || item.address || 'Residential Property',
    price_cents: Math.round(Number(price) * 100),
    bedrooms: item.bedrooms || item.beds || 3,
    bathrooms: item.bathrooms || item.baths || 2,
    square_feet: item.livingArea || item.sqft || 2000,
    street_address: item.streetAddress || item.address || '',
    city: item.city || '',
    state: item.state || '',
    zip_code: item.zipcode || item.zipCode || '',
    image_url: item.imgSrc || item.photo || (item.photos && item.photos[0]) || '/images/properties/prop-1-main.jpg',
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null,
    source: 'RAPIDAPI_ZILLOW'
  };
}

module.exports = {
  searchSaleProperties,
  normalizeListing
};
