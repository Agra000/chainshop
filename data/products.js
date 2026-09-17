// Dummy product catalog. Replace this with real data (API / on-chain
// product registry) once the backend is ready. Prices are plain numbers
// in Rupiah, formatted for display via lib/formatCurrency.js.

function imagesFor(id, count = 3) {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/chainshop-${id}-${i}/700/700`
  );
}

export const products = [
  {
    id: "p-001",
    name: "Nimbus X13 Smartphone 256GB",
    category: "smartphones",
    price: 4299000,
    rating: 4.8,
    sold: 2130,
    stock: 48,
    seller: "Nimbus Official Store",
    location: "Jakarta Barat",
    description:
      "A daily-driver phone with a 120Hz display, 5000mAh battery, and a triple camera setup. Comfortable to hold, quick to charge, and fast enough for anything from chat apps to light gaming.",
    specifications: {
      Screen: "6.5\" AMOLED, 120Hz",
      Storage: "256GB + 8GB RAM",
      Battery: "5000mAh, 33W fast charging",
      Camera: "50MP + 8MP + 2MP",
      Warranty: "12 months official warranty",
    },
    images: imagesFor("p-001"),
  },
  {
    id: "p-002",
    name: "Tera Buds Pro Wireless Earbuds",
    category: "electronics",
    price: 599000,
    rating: 4.7,
    sold: 5410,
    stock: 120,
    seller: "Tera Audio",
    location: "Bandung",
    description:
      "Active noise-cancelling earbuds with a snug fit and 28-hour total battery life via the charging case. Good for commuting, calls, and workouts alike.",
    specifications: {
      Battery: "7h (bud) + 21h (case)",
      Connectivity: "Bluetooth 5.3",
      "Water resistance": "IPX4",
      "In the box": "Earbuds, case, USB-C cable, 3 ear tip sizes",
    },
    images: imagesFor("p-002"),
  },
  {
    id: "p-003",
    name: "Aira 27\" QHD Monitor",
    category: "electronics",
    price: 2850000,
    rating: 4.9,
    sold: 860,
    stock: 22,
    seller: "Aira Display Center",
    location: "Tangerang",
    description:
      "A 27-inch QHD monitor with a 100Hz refresh rate, factory color calibration, and slim bezels — built for both work and weekend gaming sessions.",
    specifications: {
      "Panel size": "27 inch, QHD 2560x1440",
      "Refresh rate": "100Hz",
      Ports: "HDMI x2, DisplayPort, USB-C",
      "Stand": "Height, tilt, and swivel adjustable",
    },
    images: imagesFor("p-003"),
  },
  {
    id: "p-004",
    name: "Linen Blend Oversized Shirt",
    category: "fashion",
    price: 189000,
    rating: 4.6,
    sold: 3220,
    stock: 210,
    seller: "Studio Kapas",
    location: "Yogyakarta",
    description:
      "Breathable linen-cotton blend shirt cut with an oversized, relaxed fit. Pre-washed so it keeps its texture and doesn't shrink after laundering.",
    specifications: {
      Material: "55% linen, 45% cotton",
      Fit: "Oversized / relaxed",
      Sizes: "S, M, L, XL",
      Care: "Machine wash cold, hang dry",
    },
    images: imagesFor("p-004"),
  },
  {
    id: "p-005",
    name: "Everyday Canvas Tote Bag",
    category: "fashion",
    price: 129000,
    rating: 4.8,
    sold: 4110,
    stock: 300,
    seller: "Studio Kapas",
    location: "Yogyakarta",
    description:
      "A sturdy 12oz canvas tote with reinforced stitching at the handles, roomy enough for a laptop, a water bottle, and the rest of your day.",
    specifications: {
      Material: "12oz canvas",
      Dimensions: "38 x 40 x 12 cm",
      "Inner pocket": "1 zip pocket",
    },
    images: imagesFor("p-005"),
  },
  {
    id: "p-006",
    name: "Centella Calming Serum 30ml",
    category: "beauty",
    price: 149000,
    rating: 4.7,
    sold: 6780,
    stock: 500,
    seller: "Glow Theory",
    location: "Surabaya",
    description:
      "A fragrance-free serum with centella asiatica extract to calm redness and support the skin barrier. Lightweight enough to layer under sunscreen.",
    specifications: {
      Volume: "30ml",
      "Skin type": "All, including sensitive skin",
      "Key ingredient": "Centella asiatica extract 10%",
    },
    images: imagesFor("p-006"),
  },
  {
    id: "p-007",
    name: "Mineral Sunscreen SPF50 PA++++",
    category: "beauty",
    price: 98000,
    rating: 4.9,
    sold: 9020,
    stock: 640,
    seller: "Glow Theory",
    location: "Surabaya",
    description:
      "A lightweight mineral sunscreen that sits well under makeup with no white cast. Water-resistant for up to 80 minutes.",
    specifications: {
      Volume: "40ml",
      SPF: "SPF50 PA++++",
      Finish: "Semi-matte, no white cast",
    },
    images: imagesFor("p-007"),
  },
  {
    id: "p-008",
    name: "Ceramic Dinnerware Set (16pc)",
    category: "home-living",
    price: 459000,
    rating: 4.8,
    sold: 1540,
    stock: 65,
    seller: "Rumah & Rupa",
    location: "Bekasi",
    description:
      "A 16-piece stoneware set in a matte glaze — plates, bowls, and mugs for four. Microwave and dishwasher safe.",
    specifications: {
      "Set contents": "4 dinner plates, 4 side plates, 4 bowls, 4 mugs",
      Material: "Stoneware, matte glaze",
      Care: "Microwave and dishwasher safe",
    },
    images: imagesFor("p-008"),
  },
  {
    id: "p-009",
    name: "Foldable Laundry Rack",
    category: "home-living",
    price: 215000,
    rating: 4.6,
    sold: 2870,
    stock: 140,
    seller: "Rumah & Rupa",
    location: "Bekasi",
    description:
      "A rust-resistant steel drying rack that folds flat for storage. Holds up to 15kg of laundry across three tiers.",
    specifications: {
      Material: "Powder-coated steel",
      "Folded size": "60 x 8 x 90 cm",
      "Max load": "15kg",
    },
    images: imagesFor("p-009"),
  },
  {
    id: "p-010",
    name: "Cold-Pressed Extra Virgin Olive Oil 1L",
    category: "groceries",
    price: 135000,
    rating: 4.7,
    sold: 1980,
    stock: 300,
    seller: "Pasar Segar",
    location: "Depok",
    description:
      "First cold-pressed olive oil with a mild, well-balanced flavor — good for everyday cooking and finishing dishes alike.",
    specifications: {
      Volume: "1 liter",
      Origin: "Imported, bottled locally",
      "Best used within": "18 months of opening",
    },
    images: imagesFor("p-010"),
  },
  {
    id: "p-011",
    name: "Premium Jasmine Rice 5kg",
    category: "groceries",
    price: 79000,
    rating: 4.9,
    sold: 12400,
    stock: 900,
    seller: "Pasar Segar",
    location: "Depok",
    description:
      "Fragrant, long-grain jasmine rice milled in small batches for freshness. A pantry staple that cooks up light and fluffy.",
    specifications: {
      "Net weight": "5kg",
      Grade: "Premium grade",
    },
    images: imagesFor("p-011"),
  },
  {
    id: "p-012",
    name: "Mobile Credit Top Up Rp100.000",
    category: "topup",
    price: 100500,
    rating: 4.9,
    sold: 41200,
    stock: 9999,
    seller: "ChainShop Digital",
    location: "Digital delivery",
    description:
      "Instant mobile credit top up for all major Indonesian carriers. Delivered digitally within minutes of order confirmation.",
    specifications: {
      Denomination: "Rp100.000",
      Delivery: "Instant, digital code",
      Validity: "Depends on carrier's active period",
    },
    images: imagesFor("p-012"),
  },
  {
    id: "p-013",
    name: "Game Wallet Top Up 500 Gems",
    category: "topup",
    price: 149000,
    rating: 4.8,
    sold: 8830,
    stock: 9999,
    seller: "ChainShop Digital",
    location: "Digital delivery",
    description:
      "Top up 500 gems for supported mobile games. Enter your player ID at checkout and the balance lands in your account automatically.",
    specifications: {
      Amount: "500 gems",
      Delivery: "Instant, account top up",
    },
    images: imagesFor("p-013"),
  },
  {
    id: "p-014",
    name: "Wireless Gaming Mouse 8000DPI",
    category: "gaming",
    price: 379000,
    rating: 4.8,
    sold: 3350,
    stock: 90,
    seller: "Byte & Bolt",
    location: "Jakarta Selatan",
    description:
      "A lightweight wireless mouse with an 8000DPI optical sensor and a 60-hour battery life, tuned for fast, precise tracking.",
    specifications: {
      Sensor: "Optical, up to 8000 DPI",
      Connectivity: "2.4GHz wireless + Bluetooth",
      Battery: "Up to 60 hours",
      Weight: "78g",
    },
    images: imagesFor("p-014"),
  },
  {
    id: "p-015",
    name: "Mechanical Keyboard 65% Hot-Swap",
    category: "gaming",
    price: 749000,
    rating: 4.9,
    sold: 1670,
    stock: 40,
    seller: "Byte & Bolt",
    location: "Jakarta Selatan",
    description:
      "A compact 65% mechanical keyboard with hot-swappable switches and per-key RGB, so you can rebuild the feel of it any time.",
    specifications: {
      Layout: "65%, 68 keys",
      Switches: "Hot-swappable (switches included)",
      Connectivity: "USB-C wired",
      Backlight: "Per-key RGB",
    },
    images: imagesFor("p-015"),
  },
  {
    id: "p-016",
    name: "Motorcycle Chain Lubricant 200ml",
    category: "automotive",
    price: 45000,
    rating: 4.7,
    sold: 2210,
    stock: 260,
    seller: "Bengkel Maju Jaya",
    location: "Cikarang",
    description:
      "A water-resistant chain lubricant that reduces friction and keeps rust off, suitable for daily riders and long trips alike.",
    specifications: {
      Volume: "200ml",
      "Suitable for": "Motorcycle chains, all types",
    },
    images: imagesFor("p-016"),
  },
  {
    id: "p-017",
    name: "Microfiber Car Wash Mitt",
    category: "automotive",
    price: 65000,
    rating: 4.8,
    sold: 1740,
    stock: 180,
    seller: "Bengkel Maju Jaya",
    location: "Cikarang",
    description:
      "A thick microfiber wash mitt that lifts dirt without scratching paint. Machine washable and holds up over many washes.",
    specifications: {
      Material: "Microfiber chenille",
      Size: "24 x 18 cm",
    },
    images: imagesFor("p-017"),
  },
  {
    id: "p-018",
    name: "Foldable Yoga Mat 6mm",
    category: "sports",
    price: 179000,
    rating: 4.8,
    sold: 2980,
    stock: 150,
    seller: "Gerak Aktif",
    location: "Malang",
    description:
      "A 6mm non-slip yoga mat with good cushioning for joints, foldable for travel, with a carry strap included.",
    specifications: {
      Thickness: "6mm",
      Material: "TPE, non-slip texture",
      "In the box": "Mat, carry strap",
    },
    images: imagesFor("p-018"),
  },
  {
    id: "p-019",
    name: "Adjustable Dumbbell Set 20kg",
    category: "sports",
    price: 899000,
    rating: 4.9,
    sold: 640,
    stock: 30,
    seller: "Gerak Aktif",
    location: "Malang",
    description:
      "A pair of adjustable dumbbells from 2kg to 20kg total, so a full home strength set fits in the space of one pair.",
    specifications: {
      "Weight range": "2kg – 20kg (pair)",
      Material: "Cast iron plates, rubber coating",
    },
    images: imagesFor("p-019"),
  },
  {
    id: "p-020",
    name: "Baby Soft Cotton Swaddle (3pc)",
    category: "baby",
    price: 159000,
    rating: 4.9,
    sold: 3120,
    stock: 200,
    seller: "Kecil & Nyaman",
    location: "Semarang",
    description:
      "Breathable muslin cotton swaddles, soft enough for newborn skin and gets softer with every wash.",
    specifications: {
      Material: "100% muslin cotton",
      Size: "120 x 120 cm",
      "Set contents": "3 pieces",
    },
    images: imagesFor("p-020"),
  },
  {
    id: "p-021",
    name: "BPA-Free Baby Feeding Bottle 250ml",
    category: "baby",
    price: 89000,
    rating: 4.8,
    sold: 4470,
    stock: 320,
    seller: "Kecil & Nyaman",
    location: "Semarang",
    description:
      "An anti-colic feeding bottle with a slow-flow nipple, made from BPA-free materials that are easy to sterilize.",
    specifications: {
      Volume: "250ml",
      Material: "BPA-free polypropylene",
      "Nipple flow": "Slow flow, 0m+",
    },
    images: imagesFor("p-021"),
  },
  {
    id: "p-022",
    name: "Hardcover Dot Grid Notebook A5",
    category: "books",
    price: 79000,
    rating: 4.9,
    sold: 2650,
    stock: 400,
    seller: "Kertas & Tinta",
    location: "Bogor",
    description:
      "160gsm dot-grid pages that resist ink bleed-through, bound in a hardcover that lies flat when open.",
    specifications: {
      Size: "A5, 14.8 x 21 cm",
      Pages: "192 pages, 160gsm",
      Binding: "Sewn, lies flat",
    },
    images: imagesFor("p-022"),
  },
  {
    id: "p-023",
    name: "Introduction to Blockchain & Smart Contracts",
    category: "books",
    price: 145000,
    rating: 4.7,
    sold: 980,
    stock: 75,
    seller: "Kertas & Tinta",
    location: "Bogor",
    description:
      "A plain-language walkthrough of how blockchains, wallets, and smart contracts work, aimed at readers with no technical background.",
    specifications: {
      Format: "Paperback",
      Pages: "312",
      Language: "Indonesian",
    },
    images: imagesFor("p-023"),
  },
  {
    id: "p-024",
    name: "Smart Home Wi-Fi Plug (2-pack)",
    category: "electronics",
    price: 129000,
    rating: 4.7,
    sold: 3890,
    stock: 210,
    seller: "Nimbus Official Store",
    location: "Jakarta Barat",
    description:
      "Control lamps and small appliances from your phone or by schedule. Works over your existing home Wi-Fi, no hub required.",
    specifications: {
      Connectivity: "2.4GHz Wi-Fi",
      "Max load": "2200W",
      "In the box": "2 smart plugs",
    },
    images: imagesFor("p-024"),
  },
  {
    id: "p-025",
    name: "Nimbus Buds Air Charging Case Skin",
    category: "smartphones",
    price: 39000,
    rating: 4.6,
    sold: 5230,
    stock: 500,
    seller: "Nimbus Official Store",
    location: "Jakarta Barat",
    description:
      "A slim, grippy skin for your earbuds case that protects against scuffs without adding bulk.",
    specifications: {
      Material: "TPU",
      Compatibility: "Universal charging case, 4.5–5.5cm",
    },
    images: imagesFor("p-025"),
  },
  {
    id: "p-026",
    name: "Electricity Token 100kWh",
    category: "topup",
    price: 172000,
    rating: 4.9,
    sold: 15600,
    stock: 9999,
    seller: "ChainShop Digital",
    location: "Digital delivery",
    description:
      "Prepaid electricity token delivered instantly as a 20-digit code, ready to enter into your meter.",
    specifications: {
      Amount: "100 kWh (approx., admin fee applies)",
      Delivery: "Instant, digital token",
    },
    images: imagesFor("p-026"),
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function searchProducts({ category, query } = {}) {
  let result = products;
  if (category && category !== "all") {
    result = result.filter((p) => p.category === category);
  }
  if (query && query.trim().length > 0) {
    const q = query.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }
  return result;
}
