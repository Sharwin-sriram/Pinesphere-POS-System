type Item = {
  id: string
  name: string
  category: string
  spiceLevel?: 'mild' | 'medium' | 'hot'
  beverage?: boolean
  dessert?: boolean
  image?: string
}

type Combo = {
  id: string
  name: string
  items: string[]
  popularity: number
  image?: string
}

type CustomerInsight = {
  id: string
  name: string
  preorders: { itemId: string; times: number; lastOrdered: string }[]
}

export type RecommendationOutput = {
  recommendedItems: Item[]
  recommendedCombos: Combo[]
  recommendedCategories: string[]
  personalizedMessage: string
}

// Simple frontend-only recommendation logic using mock data
export function generateRecommendations(customer: CustomerInsight, allItems: Item[], allCombos: Combo[]): RecommendationOutput {
  // aggregate popularity and frequency
  const freq: Record<string, number> = {}
  customer.preorders.forEach((p) => {
    freq[p.itemId] = (freq[p.itemId] || 0) + p.times
  })

  // determine favorite categories
  const categoryCount: Record<string, number> = {}
  Object.keys(freq).forEach((itemId) => {
    const item = allItems.find((i) => i.id === itemId)
    if (item) categoryCount[item.category] = (categoryCount[item.category] || 0) + freq[itemId]
  })

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((t) => t[0])

  // recommend items: similar category + spice/beverage affinity
  const favoriteItemIds = Object.keys(freq).sort((a, b) => (freq[b] || 0) - (freq[a] || 0))
  const favoriteItems = favoriteItemIds.map((id) => allItems.find((i) => i.id === id)).filter(Boolean) as Item[]

  const spicyAffinity = favoriteItems.some((it) => it.spiceLevel === 'hot')
  const beverageAffinity = favoriteItems.some((it) => it.beverage)

  const recommendedItems = allItems
    .filter((it) => !favoriteItemIds.includes(it.id))
    .filter((it) => topCategories.includes(it.category) || (spicyAffinity && it.spiceLevel === 'hot') || (beverageAffinity && it.beverage))
    .slice(0, 6)

  // recommend combos that include recommended items or favorite items
  const recommendedCombos = allCombos
    .map((combo) => ({
      ...combo,
      score: combo.items.reduce((s, itemId) => s + (freq[itemId] || 0), 0) + combo.popularity / 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  const personalizedMessage = buildMessage(favoriteItems, topCategories)

  return {
    recommendedItems,
    recommendedCombos,
    recommendedCategories: topCategories,
    personalizedMessage,
  }
}

function buildMessage(favorites: Item[], categories: string[]) {
  if (!favorites.length) return 'Personalized picks to kickstart your recommendations.'
  const fav = favorites[0]
  const parts: string[] = []
  if (fav.spiceLevel === 'hot') parts.push('Customers who love spicy dishes also enjoyed bold picks')
  if (fav.beverage) parts.push('Beverage-focused pairings')
  parts.push(`${categories[0] || 'popular'} picks for you`)
  return `${parts.join(' · ')}. Recommended for your next preorder.`
}

export default { generateRecommendations }
