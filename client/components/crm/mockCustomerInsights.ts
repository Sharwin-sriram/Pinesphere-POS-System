export const mockItems = [
  { id: 'i1', name: 'Spicy Ramen', category: 'Mains', spiceLevel: 'hot', beverage: false, dessert: false, image: '/images/items/teriyaki-special.jpg' },
  { id: 'i2', name: 'Dragon Noodles', category: 'Mains', spiceLevel: 'hot', beverage: false, dessert: false, image: '/images/items/tacos.jpg' },
  { id: 'i3', name: 'Garlic Chicken Bowl', category: 'Mains', spiceLevel: 'medium', beverage: false, dessert: false, image: '/images/items/featured-dish.jpg' },
  { id: 'i4', name: 'Cold Coffee', category: 'Beverages', beverage: true, spiceLevel: 'mild', dessert: false, image: '/images/items/smoothie.jpg' },
  { id: 'i5', name: 'Miso Ramen', category: 'Mains', spiceLevel: 'medium', beverage: false, dessert: false, image: '/images/items/teriyaki.jpg' },
  { id: 'i6', name: 'Cheesecake', category: 'Desserts', dessert: true, beverage: false, image: '/images/items/fallback.jpg' },
]

export const mockCombos = [
  { id: 'c1', name: 'Protein Combo', items: ['i3', 'i4'], popularity: 86, image: '/images/combos/featured-combo.jpg' },
  { id: 'c2', name: 'Spicy Duo', items: ['i1', 'i2'], popularity: 92, image: '/images/combos/spicy-duo.jpg' },
  { id: 'c3', name: 'Weekend Feast', items: ['i2', 'i3', 'i6'], popularity: 77, image: '/images/combos/weekend-feast.jpg' },
]

export const mockCustomers = [
  {
    id: 'cust_1',
    name: 'Mason Lee',
    preorders: [
      { itemId: 'i1', times: 8, lastOrdered: '2026-05-18' },
      { itemId: 'i4', times: 6, lastOrdered: '2026-05-22' },
      { itemId: 'i3', times: 4, lastOrdered: '2026-05-12' },
    ],
  },
  {
    id: 'cust_2',
    name: 'Ava Romero',
    preorders: [
      { itemId: 'i5', times: 5, lastOrdered: '2026-05-20' },
      { itemId: 'i6', times: 3, lastOrdered: '2026-05-19' },
    ],
  },
]
