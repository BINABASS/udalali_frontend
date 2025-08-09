export const mockProperties = [
  {
    id: 1,
    sellerId: 1,
    title: "Luxury Villa with Ocean View",
    type: "villa",
    status: "available",
    price: 1500000,
    bedrooms: 5,
    bathrooms: 4.5,
    area: 3500,
    description: "A stunning 5-bedroom villa with panoramic ocean views, featuring a private pool, spacious living areas, and modern amenities. Perfect for large families or luxury retreats.",
    location: "123 Ocean Drive, Paradise Beach",
    amenities: ["pool", "garden", "wifi", "parking", "gym", "ac", "kitchen"],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    createdAt: "2025-07-01T10:00:00Z",
    lastUpdated: "2025-07-01T10:00:00Z"
  },
  {
    id: 2,
    sellerId: 1,
    title: "Modern Apartment in City Center",
    type: "apartment",
    status: "available",
    price: 250000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    description: "Spacious 2-bedroom apartment in the heart of the city, featuring modern finishes, large windows, and easy access to amenities. Ideal for young professionals or couples.",
    location: "456 Main Street, Downtown",
    amenities: ["wifi", "parking", "ac", "kitchen"],
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    createdAt: "2025-06-25T14:30:00Z",
    lastUpdated: "2025-06-25T14:30:00Z"
  },
  {
    id: 3,
    sellerId: 2,
    title: "Family-Friendly House",
    type: "house",
    status: "available",
    price: 850000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2200,
    description: "Comfortable 4-bedroom house in a quiet residential area, complete with a large backyard and modern kitchen. Perfect for families looking for space and privacy.",
    location: "789 Greenway Lane, Suburbia",
    amenities: ["garden", "wifi", "parking", "ac", "kitchen"],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    createdAt: "2025-07-05T09:15:00Z",
    lastUpdated: "2025-07-05T09:15:00Z"
  },
  {
    id: 4,
    sellerId: 2,
    title: "Luxury Condominium",
    type: "condo",
    status: "maintenance",
    price: 450000,
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1500,
    description: "High-end condominium with premium finishes, floor-to-ceiling windows, and access to all building amenities. Currently undergoing maintenance upgrade.",
    location: "890 Skyview Tower, Business District",
    amenities: ["gym", "wifi", "parking", "ac", "kitchen"],
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    createdAt: "2025-07-02T16:45:00Z",
    lastUpdated: "2025-07-02T16:45:00Z"
  },
  {
    id: 5,
    sellerId: 3,
    title: "Cozy Townhouse",
    type: "townhouse",
    status: "available",
    price: 320000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    description: "Charming 3-bedroom townhouse in a walkable neighborhood, featuring a private patio and modern kitchen. Ideal first home or investment property.",
    location: "101 Main Street, Historic District",
    amenities: ["garden", "wifi", "parking", "ac", "kitchen"],
    image: "https://images.unsplash.com/photo-1560448205-73f84f80905a",
    createdAt: "2025-07-03T11:20:00Z",
    lastUpdated: "2025-07-03T11:20:00Z"
  }
];

// Helper function to get a random property
export const getRandomProperty = () => {
  return mockProperties[Math.floor(Math.random() * mockProperties.length)];
};

// Helper function to get multiple random properties
export const getRandomProperties = (count = 3) => {
  const properties = [];
  for (let i = 0; i < count; i++) {
    properties.push(getRandomProperty());
  }
  return properties;
};
