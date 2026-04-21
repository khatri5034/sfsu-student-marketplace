import { reactive } from 'vue'

export const categories = [
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' }
]

export const courses = [
  'CSC 648', 'CSC 415', 'CSC 413', 'CSC 220', 'CSC 210',
  'BIOL 100', 'BIOL 101', 'CHEM 115', 'PHYS 111',
  'ACCT 100', 'BUS 300', 'ECON 101',
  'ART 360', 'ENGL 214', 'HIST 101'
]

export const pickupLocations = [
  { id: 1, name: 'J. Paul Leonard Library', description: 'Main entrance, ground floor' },
  { id: 2, name: 'Cesar Chavez Student Center', description: 'Near the food court' },
  { id: 3, name: 'Science Building', description: 'Main lobby, 1st floor' },
  { id: 4, name: 'HSS Building', description: 'Near the main entrance' },
  { id: 5, name: 'Student Services Building', description: 'Front steps area' }
]

export const listings = reactive([
  {
    id: 1,
    title: 'CSC 648 Software Engineering Textbook',
    description: 'Barely used textbook for CSC 648. Great condition — only highlighted chapters 1–3. Includes all original pages and no missing content. Perfect for the current semester.',
    price: 45,
    category: 'textbooks',
    course: 'CSC 648',
    condition: 'Good',
    listingType: 'both',
    pickupLocationId: 1,
    image: null,
    sellerName: 'Alex Chen',
    sellerEmail: 'achen@sfsu.edu',
    createdAt: '2026-04-10'
  },
  {
    id: 2,
    title: 'LED Desk Lamp (Adjustable)',
    description: 'Adjustable LED desk lamp with 3 brightness levels. Perfect for late-night studying. Works great — just upgrading to a new one. Includes power adapter.',
    price: 15,
    category: 'furniture',
    course: null,
    condition: 'Like New',
    listingType: 'both',
    pickupLocationId: 2,
    image: null,
    sellerName: 'Maya Patel',
    sellerEmail: 'mpatel@sfsu.edu',
    createdAt: '2026-04-12'
  },
  {
    id: 3,
    title: 'MacBook Pro 65W Charger',
    description: 'USB-C 65W charger compatible with MacBook Pro and Air. Works perfectly, selling because I got a new laptop. Includes 2m cable.',
    price: 20,
    category: 'electronics',
    course: null,
    condition: 'Good',
    listingType: 'sale',
    pickupLocationId: 3,
    image: null,
    sellerName: 'Kevin Torres',
    sellerEmail: 'ktorres@sfsu.edu',
    createdAt: '2026-04-14'
  },
  {
    id: 4,
    title: 'SFSU Hoodie — Size M',
    description: 'Official SFSU hoodie in size Medium. Worn a few times, still in great shape. No stains or tears. Purple with gold print.',
    price: 30,
    category: 'clothing',
    course: null,
    condition: 'New',
    listingType: 'sale',
    pickupLocationId: 2,
    image: null,
    sellerName: 'Sara Nguyen',
    sellerEmail: 'snguyen@sfsu.edu',
    createdAt: '2026-04-15'
  },
  {
    id: 5,
    title: 'BIOL 100 Lab Manual + Textbook Bundle',
    description: 'Both the BIOL 100 textbook and lab manual included. Some pencil notes in the textbook. Lab manual is clean. Selling as a bundle — great deal for incoming bio students.',
    price: 35,
    category: 'textbooks',
    course: 'BIOL 100',
    condition: 'Fair',
    listingType: 'both',
    pickupLocationId: 1,
    image: null,
    sellerName: 'Jordan Westover',
    sellerEmail: 'jwestover@sfsu.edu',
    createdAt: '2026-04-16'
  },
  {
    id: 6,
    title: 'Mechanical Keyboard (TKL)',
    description: 'Tenkeyless mechanical keyboard with Cherry MX Blue switches. Great for coding and typing. Includes original box and USB cable. Selling because I switched to wireless.',
    price: 55,
    category: 'electronics',
    course: null,
    condition: 'Like New',
    listingType: 'trade',
    pickupLocationId: 4,
    image: null,
    sellerName: 'Chris Park',
    sellerEmail: 'cpark@sfsu.edu',
    createdAt: '2026-04-17'
  },
  {
    id: 7,
    title: 'ACCT 100 Principles of Accounting',
    description: 'Principles of Accounting textbook for ACCT 100. 4th edition. Clean copy, no writing inside. Required for the intro accounting course.',
    price: 40,
    category: 'textbooks',
    course: 'ACCT 100',
    condition: 'Good',
    listingType: 'sale',
    pickupLocationId: 5,
    image: null,
    sellerName: 'Priya Singh',
    sellerEmail: 'psingh@sfsu.edu',
    createdAt: '2026-04-18'
  },
  {
    id: 8,
    title: 'Mini Fridge (1.7 cu ft)',
    description: 'Compact dorm mini fridge. Works perfectly, very clean inside. Great for beverages and snacks. Selling because I am moving off campus. You arrange pickup.',
    price: 60,
    category: 'furniture',
    course: null,
    condition: 'Good',
    listingType: 'both',
    pickupLocationId: 2,
    image: null,
    sellerName: 'David Kim',
    sellerEmail: 'dkim@sfsu.edu',
    createdAt: '2026-04-19'
  }
])

export const conversations = reactive([
  {
    id: 1,
    listingId: 5,
    listingTitle: 'BIOL 100 Lab Manual + Textbook Bundle',
    otherPartyName: 'Alex Chen',
    messages: [
      { id: 1, sender: 'them', body: 'Hey, is this still available?', time: '10:30 AM' },
      { id: 2, sender: 'me', body: 'Yes! Are you interested in the bundle?', time: '10:45 AM' },
      { id: 3, sender: 'them', body: 'Definitely. Can we meet at the library?', time: '11:00 AM' },
      { id: 4, sender: 'me', body: 'Sure! How about tomorrow at 2pm?', time: '11:05 AM' }
    ]
  },
  {
    id: 2,
    listingId: 5,
    listingTitle: 'BIOL 100 Lab Manual + Textbook Bundle',
    otherPartyName: 'Sara Nguyen',
    messages: [
      { id: 1, sender: 'them', body: 'Would you take $25 for just the textbook?', time: '9:00 AM' },
      { id: 2, sender: 'me', body: 'I prefer to sell as a bundle, sorry!', time: '9:15 AM' }
    ]
  }
])
