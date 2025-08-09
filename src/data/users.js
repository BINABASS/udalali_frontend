// Mock user database
export const users = {
  // Admin credentials
  'admin@udigi.com': {
    email: 'admin@udigi.com',
    password: 'admin999',
    role: 'admin',
    name: 'System Administrator'
  },

  // Seller credentials
  'seller1@udigi.com': {
    email: 'seller1@udigi.com',
    password: 'seller123',
    role: 'seller',
    name: 'John Doe',
    id: 1
  },

  'seller2@udigi.com': {
    email: 'seller2@udigi.com',
    password: 'seller123',
    role: 'seller',
    name: 'Jane Smith',
    id: 2
  },

  // Buyer credentials
  'buyer1@udigi.com': {
    email: 'buyer1@udigi.com',
    password: 'buyer123',
    role: 'buyer',
    name: 'Michael Johnson'
  },
  'buyer2@udigi.com': {
    email: 'buyer2@udigi.com',
    password: 'buyer123',
    role: 'buyer',
    name: 'Sarah Wilson'
  },

  'binos@udigi.com': {
    email: 'binos@udigi.com',
    password: 'binos123',
    role: 'seller',
    name: 'Binos',
    id: 3
  }
};

// Function to validate login credentials
export const validateCredentials = (email, password) => {
  // Check predefined users first
  const user = users[email];
  if (user && user.password === password) {
    return { ...user }; // Return a copy to prevent reference issues
  }

  // Check registered users in localStorage
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const foundUser = registeredUsers.find(u => 
      u.email === email && 
      u.password === password
    );
    
    if (foundUser) {
      // Ensure consistent user object structure
      return {
        email: foundUser.email,
        password: foundUser.password,
        role: foundUser.role || 'buyer', // Default to 'buyer' if role is missing
        name: foundUser.name || email.split('@')[0], // Default name if missing
        ...(foundUser.id && { id: foundUser.id }) // Include id if it exists
      };
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }

  return null;
};
