export const mockListings = [
  {
    id: '1',
    title: 'Warm Winter Coats',
    category: 'clothes',
    urgency: 'flexible',
    description: 'Two gently used winter coats, size L.',
    image_url: 'https://images.unsplash.com/photo-1544923408-2fb0c9664f33?auto=format&fit=crop&q=80',
    pickup_time: 'Weekend mornings',
    lat: 40.7128,
    lng: -74.0060,
    donor: { name: 'Alice D.', rating: 4.8 }
  },
  {
    id: '2',
    title: 'Fresh Bread and Pastries',
    category: 'food',
    urgency: 'urgent',
    description: 'Surplus from bakery, must be picked up today.',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80',
    pickup_time: 'Today before 5 PM',
    lat: 40.7150,
    lng: -74.0100,
    donor: { name: 'Local Bakery', rating: 5.0 }
  },
  {
    id: '3',
    title: 'Calculus Textbooks',
    category: 'study',
    urgency: '24hrs',
    description: 'High school math textbooks in good condition.',
    image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80',
    pickup_time: 'Tomorrow evening',
    lat: 40.7300,
    lng: -73.9900,
    donor: { name: 'Mark S.', rating: 4.5 }
  }
];

// Haversine formula to calculate distance in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}
