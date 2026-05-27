const fs = require('fs')
const path = require('path')

const base64Jpeg = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEBAVEBAVEBUQEA8PDw8QDw8QFhURFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBEQACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAAAgMEBQYBB//EADUQAAIBAwMCBAMGBwAAAAAAAAECAwAEEQUSITFBUQYTMnGBkaGx0SNCUmJywdHwFSM0UuL/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/EAB8RAQEBAAMBAQEAAAAAAAAAAAABEQISITFBUSJRMf/aAAwDAQACEQMRAD8A9lAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/2Q=='

function writeFile(filePath) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  const buffer = Buffer.from(base64Jpeg, 'base64')
  fs.writeFileSync(filePath, buffer)
  console.log('Wrote', filePath)
}

const files = [
  // categories
  'public/images/menu/categories/mains.jpg',
  'public/images/menu/categories/starters.jpg',
  'public/images/menu/categories/drinks.jpg',
  'public/images/menu/categories/desserts.jpg',
  'public/images/menu/categories/sides.jpg',
  'public/images/menu/categories/seasonal.jpg',
  'public/images/menu/categories/mains-visual.jpg',
  'public/images/menu/categories/starters-visual.jpg',
  'public/images/menu/categories/drinks-visual.jpg',
  'public/images/menu/categories/desserts-visual.jpg',

  // items
  'public/images/menu/items/teriyaki.jpg',
  'public/images/menu/items/tacos.jpg',
  'public/images/menu/items/smoothie.jpg',
  'public/images/menu/items/featured-dish.jpg',
  'public/images/menu/items/item-1.jpg',
  'public/images/menu/items/item-2.jpg',
  'public/images/menu/items/item-3.jpg',
  'public/images/menu/items/fallback.jpg',

  // modifiers
  'public/images/menu/modifiers/modifier-1.jpg',
  'public/images/menu/modifiers/modifier-2.jpg',
  'public/images/menu/modifiers/modifier-fallback.jpg',
  'public/images/menu/modifiers/ingredients-visual.jpg',

  // combos
  'public/images/menu/combos/family-pack.jpg',
  'public/images/menu/combos/promo.jpg',
  'public/images/menu/combos/family-feast.jpg',
  'public/images/menu/combos/combo-1.jpg',
  'public/images/menu/combos/combo-2.jpg',
  'public/images/menu/combos/combo-3.jpg',
  'public/images/menu/combos/combo-fallback.jpg',

  // pricing
  'public/images/menu/pricing/pricing-1.jpg',
  'public/images/menu/pricing/pricing-2.jpg',
  'public/images/menu/pricing/premium-dining.jpg',
  'public/images/menu/pricing/fine-dining.jpg',

  // dashboard
  'public/images/menu/dashboard/lounge-flow.jpg',
  'public/images/menu/dashboard/revenue-command.jpg',
  'public/images/menu/dashboard/service-metrics.jpg',
  'public/images/menu/dashboard/fallback-interior.jpg',
  'public/images/menu/dashboard/menu-performance.jpg',
  'public/images/menu/dashboard/overview-4.jpg',
  'public/images/menu/dashboard/dashboard-fallback.jpg',

  // global fallbacks / placeholders
  'public/images/menu/fallback.jpg',
  'public/images/placeholder.jpg'
]

files.forEach((f) => writeFile(path.join(__dirname, '..', f)))
console.log('All placeholder images written.')
