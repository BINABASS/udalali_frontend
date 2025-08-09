// Mock property data
export const properties = [
  {
    id: 1,
    title: 'Luxury Apartment in Downtown',
    description: 'Modern 3-bedroom apartment with stunning city views',
    price: 550000,
    type: 'apartment',
    status: 'available',
    address: '123 Downtown Ave',
    city: 'City Center',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    amenities: ['pool', 'garden', 'security', 'parking', 'wifi', 'gym'],
    images: [
      '/property1-1.jpg',
      '/property1-2.jpg',
      '/property1-3.jpg'
    ],
    seller: {
      id: 1,
      name: 'John Doe',
      email: 'seller1@udigi.com'
    },
    createdAt: '2025-07-01',
    views: 150,
    inquiries: 12
  },
  {
    id: 2,
    title: 'Family Home in Suburb',
    description: 'Spacious 4-bedroom family home with large garden',
    price: 420000,
    type: 'house',
    status: 'pending',
    address: '456 Suburb Street',
    city: 'Suburban Area',
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    amenities: ['garden', 'security', 'parking', 'wifi', 'balcony', 'pet friendly'],
    images: [
      '/property2-1.jpg',
      '/property2-2.jpg',
      '/property2-3.jpg'
    ],
    seller: {
      id: 2,
      name: 'Jane Smith',
      email: 'seller2@udigi.com'
    },
    createdAt: '2025-07-02',
    views: 85,
    inquiries: 5
  }
];

// Property types and statuses for filtering
export const propertyTypes = ['apartment', 'house', 'villa', 'townhouse', 'commercial', 'land'];
export const propertyStatuses = ['available', 'pending', 'sold', 'rented'];
