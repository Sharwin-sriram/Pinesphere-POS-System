const https = require("https");
const fs = require("fs");
const path = require("path");

const images = [
  // Fallbacks
  { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop", dest: "public/images/fallbacks/default-restaurant.jpg" },
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop", dest: "public/images/menu/fallback.jpg" },

  // Interiors (overview slideshow)
  { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop", dest: "public/images/menu/interiors/restaurant-interior.jpg" },
  { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop", dest: "public/images/menu/interiors/fallback-interior.jpg" },

  // Categories — each unique food photo
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/mains.jpg" },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/mains-visual.jpg" },
  { url: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/starters.jpg" },
  { url: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/starters-visual.jpg" },
  { url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/desserts.jpg" },
  { url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/desserts-visual.jpg" },
  { url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/drinks.jpg" },
  { url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/drinks-visual.jpg" },
  { url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/seasonal.jpg" },
  { url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/sides.jpg" },
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop", dest: "public/images/menu/categories/fallback.jpg" },

  // Items — each unique dish photo
  { url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&auto=format&fit=crop", dest: "public/images/menu/items/featured-dish.jpg" },
  { url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop", dest: "public/images/menu/items/tacos.jpg" },
  { url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop", dest: "public/images/menu/items/teriyaki.jpg" },
  { url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop", dest: "public/images/menu/items/teriyaki-special.jpg" },
  { url: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&auto=format&fit=crop", dest: "public/images/menu/items/smoothie.jpg" },
  { url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&auto=format&fit=crop", dest: "public/images/menu/items/fallback.jpg" },

  // Modifiers
  { url: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800&auto=format&fit=crop", dest: "public/images/menu/modifiers/ingredients-visual.jpg" },
  { url: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800&auto=format&fit=crop", dest: "public/images/menu/modifiers/modifier-1.jpg" },
  { url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&auto=format&fit=crop", dest: "public/images/menu/modifiers/modifier-2.jpg" },
  { url: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800&auto=format&fit=crop", dest: "public/images/menu/modifiers/fallback.jpg" },

  // Combos
  { url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop", dest: "public/images/menu/combos/family-feast.jpg" },
  { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop", dest: "public/images/menu/combos/family-pack.jpg" },
  { url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop", dest: "public/images/menu/combos/fallback.jpg" },

  // Pricing
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop", dest: "public/images/menu/pricing/premium-dining.jpg" },
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop", dest: "public/images/menu/pricing/pricing-1.jpg" },
  { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&auto=format&fit=crop", dest: "public/images/menu/pricing/pricing-2.jpg" },
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop", dest: "public/images/menu/pricing/fallback.jpg" },

  // Dashboard
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop", dest: "public/images/menu/dashboard/menu-performance.jpg" },
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop", dest: "public/images/menu/dashboard/fallback.jpg" },

  // Overview
  { url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&auto=format&fit=crop", dest: "public/images/menu/overview-4.jpg" },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`Downloading ${images.length} images...`);
  for (const img of images) {
    try {
      await download(img.url, img.dest);
      console.log(`✅ ${img.dest}`);
    } catch (e) {
      console.log(`❌ Failed: ${img.dest} — ${e.message}`);
    }
  }
  console.log("\n✅ Done! Restart your dev server.");
}

main();