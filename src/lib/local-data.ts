export const AREAS = [
  "Station Road",
  "Civil Lines",
  "Degree College",
  "Kalu Kuan",
  "Mahaviriran",
  "Nawalabad",
] as const;

export const FEES = {
  packaging: 5,
  freeDeliveryAbove: 149,
  smallOrderBelow: 100,
  smallOrderFee: 15,
  standardFee: 25,
  expressFee: 25,
  /** Visit charge: only for coming to your home. Work/parts are billed separately. */
  visitCharge: 99,
  inspection: 99,
  atmFee: 20,
  /** Flat delivery for street-food (Local Bites) orders. No packaging fee. */
  streetDelivery: 10,
  /** Extra charge when the user insists on one specific stall. */
  stallPickupExtra: 10,
};

/** Street food sold as plates/packs — minimum 2 plates per order. */
/** Demand-board categories map 1:1 to the Services tabs so a posted need shows up there. */
export const demandCategories = [
  { id: "workers", label: "Worker / Mistri", hindi: "मिस्त्री" },
  { id: "skills", label: "Skill / Freelancer", hindi: "स्किल" },
  { id: "health", label: "Health / Doctor", hindi: "स्वास्थ्य" },
  { id: "rooms", label: "Room / Rent", hindi: "कमरा" },
  { id: "tutors", label: "Tutor", hindi: "ट्यूटर" },
  { id: "product", label: "Product / Saman", hindi: "सामान" },
] as const;

export type StreetItem = {
  id: string;
  name: string;
  hindi: string;
  price: number;
  unit: string;
  unitHindi: string;
  minQty: number;
  imageKey: string;
  desc: string;
};

export const streetItems: StreetItem[] = [
  {
    id: "sf-golgappe",
    name: "Pani Puri (Golgappe)",
    hindi: "पानी पूरी / गोलगप्पे",
    price: 15,
    unit: "1 plate · 4 pcs",
    unitHindi: "1 प्लेट · 4 पीस",
    minQty: 2,
    imageKey: "street-golgappe",
    desc: "Teekha pudina paani, crispy puri — ₹15 ki 1 plate (4 pcs), ₹30 ki 2 plate.",
  },
  {
    id: "sf-samosa",
    name: "Samosa (pack of 2)",
    hindi: "समोसा (2 का पैक)",
    price: 25,
    unit: "pack of 2",
    unitHindi: "2 का पैक",
    minQty: 2,
    imageKey: "street-samosa",
    desc: "Samose sirf 2 ke pack me. 2 pack = 4 samose = ₹50.",
  },
  {
    id: "sf-tikki",
    name: "Aloo Tikki Chaat",
    hindi: "आलू टिक्की चाट",
    price: 40,
    unit: "1 plate",
    unitHindi: "1 प्लेट",
    minQty: 2,
    imageKey: "street-tikki",
    desc: "Crispy tikki, dahi, imli chutney aur masala.",
  },
  {
    id: "sf-momos",
    name: "Veg Momos",
    hindi: "वेज मोमोज",
    price: 50,
    unit: "1 plate · 6 pcs",
    unitHindi: "1 प्लेट · 6 पीस",
    minQty: 2,
    imageKey: "street-momos",
    desc: "Steamed momos with teekhi lal chutney.",
  },
  {
    id: "sf-kachori",
    name: "Kachori (pack of 2)",
    hindi: "कचौड़ी (2 का पैक)",
    price: 20,
    unit: "pack of 2",
    unitHindi: "2 का पैक",
    minQty: 2,
    imageKey: "street-samosa",
    desc: "Garam kachori with aloo sabzi.",
  },
];

/** Which items each stall actually sells (price override optional). */
export const stallMenus: Record<string, { itemId: string; price?: number }[]> = {
  f1: [
    { itemId: "sf-tikki" },
    { itemId: "sf-golgappe" },
    { itemId: "sf-samosa", price: 28 },
  ],
  f2: [
    { itemId: "sf-samosa" },
    { itemId: "sf-kachori" },
    { itemId: "sf-tikki", price: 45 },
  ],
  f3: [{ itemId: "sf-momos" }, { itemId: "sf-tikki", price: 45 }],
  f4: [{ itemId: "sf-golgappe" }, { itemId: "sf-samosa", price: 26 }],
};

export type Stall = {
  id: string;
  name: string;
  nameHindi: string;
  vendorHindi: string;
  locationHindi: string;
  vendor: string;
  location: string;
  rating: number;
  price: number;
  imageKey: string;
  model: "partner" | "pickup";
  eta: string;
};

export const stalls: Stall[] = [
  {
    id: "f1",
    nameHindi: "कालू कुआं फेमस आलू टिक्की चाट",
    vendorHindi: "पंकज चाट कॉर्नर",
    locationHindi: "कालू कुआं, बांदा",
    name: "Kalu Kuan Famous Aloo Tikki Chaat",
    vendor: "Pankaj Chaat Corner",
    location: "Kalu Kuan, Banda",
    rating: 4.8,
    price: 40,
    imageKey: "street-tikki",
    model: "pickup",
    eta: "20-30 min",
  },
  {
    id: "f2",
    nameHindi: "रेलवे स्टेशन समोसा और कचौड़ी",
    vendorHindi: "शुक्ला समोसा भंडार",
    locationHindi: "स्टेशन रोड, बांदा",
    name: "Railway Station Samosa & Kachori",
    vendor: "Shukla Samosa Bhandar",
    location: "Station Road, Banda",
    rating: 4.9,
    price: 20,
    imageKey: "street-samosa",
    model: "pickup",
    eta: "20-30 min",
  },
  {
    id: "f3",
    nameHindi: "गुप्ता जी के स्पेशल वेज मोमोज",
    vendorHindi: "गुप्ता जी का ठेला",
    locationHindi: "सिविल लाइंस, बांदा",
    name: "Gupta Ji Ke Special Veg Momos",
    vendor: "Gupta Ji Ka Thela",
    location: "Civil Lines, Banda",
    rating: 4.7,
    price: 50,
    imageKey: "street-momos",
    model: "partner",
    eta: "15-20 min",
  },
  {
    id: "f4",
    nameHindi: "चौक स्पेशल गोलगप्पे (6 पीस)",
    vendorHindi: "भैया जी पानी पूरी",
    locationHindi: "चौक बाज़ार, बांदा",
    name: "Chowk Special Golgappe (6 pcs)",
    vendor: "Bhaiya Ji Pani Puri",
    location: "Chowk Bazaar, Banda",
    rating: 4.6,
    price: 30,
    imageKey: "street-golgappe",
    model: "pickup",
    eta: "25-30 min",
  },
];

export type Shop = {
  id: string;
  name: string;
  nameHindi: string;
  tagsHindi: string;
  locationHindi: string;
  location: string;
  tags: string;
  imageKey: string;
  rating: number;
  eta: number;
};

export const shops: Shop[] = [
  {
    id: "sh1",
    nameHindi: "साहू स्वीट्स एंड बेकरी",
    tagsHindi: "गुलाब जामुन • पेड़ा • केक",
    locationHindi: "स्टेशन रोड, बांदा",
    name: "Sahu Sweets & Bakery",
    location: "Station Road, Banda",
    tags: "Gulab Jamun • Peda • Cakes",
    imageKey: "shop-sweets",
    rating: 4.8,
    eta: 25,
  },
  {
    id: "sh2",
    nameHindi: "गुप्ता जनरल एंड कॉस्मेटिक्स",
    tagsHindi: "कॉस्मेटिक्स • होम केयर • टॉयलेटरीज़",
    locationHindi: "बाबू पुरा, बांदा",
    name: "Gupta General & Cosmetics",
    location: "Babu Pura, Banda",
    tags: "Cosmetics • Home Care • Toiletries",
    imageKey: "shop-general",
    rating: 4.6,
    eta: 30,
  },
  {
    id: "sh3",
    nameHindi: "बांदा बुक डिपो",
    tagsHindi: "स्टेशनरी • एग्ज़ाम नोट्स • किताबें",
    locationHindi: "सिविल लाइंस, बांदा",
    name: "Banda Book Depot",
    location: "Civil Lines, Banda",
    tags: "Stationery • Exam Notes • Books",
    imageKey: "shop-books",
    rating: 4.7,
    eta: 40,
  },
];

export const tradeCategories = [
  { id: "plumber", label: "Plumber", hindi: "प्लंबर" },
  { id: "electrician", label: "Electrician", hindi: "इलेक्ट्रीशियन" },
  { id: "bike", label: "Bike Mechanic", hindi: "बाइक मिस्त्री" },
  { id: "carpenter", label: "Carpenter", hindi: "बढ़ई" },
];

export type Pro = {
  id: string;
  name: string;
  trade: string;
  location: string;
  rating: number;
  jobs: number;
  imageKey: string;
  experience: string;
  distanceKm: number;
  reelQuote: string;
};

export const pros: Pro[] = [
  {
    id: "sp1",
    name: "Ramesh Kumar",
    trade: "plumber",
    location: "Alha Ghat, Banda",
    rating: 4.8,
    jobs: 320,
    imageKey: "worker-plumber",
    experience: "8 yrs exp",
    distanceKm: 1.2,
    reelQuote: "Tap leak 20 minute me theek kar diya, rate bhi fix tha.",
  },
  {
    id: "sp2",
    name: "Sonu Vishwakarma",
    trade: "electrician",
    location: "Civil Lines, Banda",
    rating: 4.9,
    jobs: 410,
    imageKey: "worker-electrician",
    experience: "12 yrs exp",
    distanceKm: 2.4,
    reelQuote: "Poore ghar ki wiring check ki, koi extra charge nahi liya.",
  },
  {
    id: "sp3",
    name: "Imran Bike Point",
    trade: "bike",
    location: "Station Road, Banda",
    rating: 4.7,
    jobs: 260,
    imageKey: "worker-mechanic",
    experience: "6 yrs exp",
    distanceKm: 0.8,
    reelQuote: "Ghar aake bike start kar di, mechanic dhoondhne ki zarurat nahi.",
  },
  {
    id: "sp4",
    name: "Deshraj Carpenter",
    trade: "carpenter",
    location: "Mataundh Road, Banda",
    rating: 4.6,
    jobs: 180,
    imageKey: "worker-carpenter",
    experience: "10 yrs exp",
    distanceKm: 3.6,
    reelQuote: "Almari ka door perfect fit kiya, kaam safai se hua.",
  },
];

export const doctors = [
  {
    id: "d1",
    name: "Dr. S. K. Tiwari",
    speciality: "General Physician (MBBS, MD)",
    clinic: "Tiwari Clinic, Station Road",
    rating: 4.9,
    fee: 300,
    imageKey: "doctor-1",
    homeVisit: true,
  },
  {
    id: "d2",
    name: "Dr. Anjali Verma",
    speciality: "Child Specialist (Pediatrician)",
    clinic: "Verma Child Care, Civil Lines",
    rating: 4.8,
    fee: 350,
    imageKey: "doctor-2",
    homeVisit: false,
  },
];

export const labTests = [
  { id: "l1", name: "Complete Blood Count (CBC)", price: 250, mrp: 400 },
  { id: "l2", name: "Full Body Checkup (60 params)", price: 999, mrp: 1800 },
  { id: "l3", name: "Diabetes Profile (HbA1c)", price: 450, mrp: 700 },
  { id: "l4", name: "Thyroid Profile (T3 T4 TSH)", price: 400, mrp: 650 },
];

export type Listing = {
  id: string;
  title: string;
  meta: string;
  price: string;
  location: string;
  by: string;
  type: "supply" | "demand";
  distanceKm: number;
  rating: number;
};

export const rentListings: Listing[] = [
  {
    id: "r1",
    title: "1 BHK Furnished Room",
    meta: "1 BHK • Furnished • Bachelors allowed",
    price: "₹4,500 / month",
    location: "Near Degree College, Banda",
    by: "Owner: Mahesh Gupta",
    type: "supply",
    distanceKm: 1.5,
    rating: 4.5,
  },
  {
    id: "r2",
    title: "2 BHK Family Flat",
    meta: "2 BHK • Semi-furnished • Family only",
    price: "₹8,000 / month",
    location: "Civil Lines, Banda",
    by: "Owner: Sunita Devi",
    type: "supply",
    distanceKm: 2.8,
    rating: 4.7,
  },
  {
    id: "r3",
    title: "Student Single Room Needed",
    meta: "Student • Budget under ₹2,500",
    price: "Budget ₹2,500",
    location: "Near Degree College",
    by: "Student: Rahul",
    type: "demand",
    distanceKm: 1.1,
    rating: 4.2,
  },
];

export const tutorListings: Listing[] = [
  {
    id: "t1",
    title: "Maths & Science Home Tutor",
    meta: "Class 6-10 • CBSE / UP Board",
    price: "₹1,200 / month",
    location: "Station Road, Banda",
    by: "Tutor: Amit Sir",
    type: "supply",
    distanceKm: 0.9,
    rating: 4.8,
  },
  {
    id: "t2",
    title: "SSC CGL & Bank Coaching",
    meta: "Reasoning • Quant • English",
    price: "₹1,800 / month",
    location: "Civil Lines, Banda",
    by: "Tutor: Priya Ma'am",
    type: "supply",
    distanceKm: 2.2,
    rating: 4.9,
  },
  {
    id: "t3",
    title: "Spoken English Tutor Needed",
    meta: "Evening slot • Home visit",
    price: "Budget ₹1,000",
    location: "Babu Pura, Banda",
    by: "Student: Neha",
    type: "demand",
    distanceKm: 1.7,
    rating: 4.3,
  },
];

export const skills = [
  {
    id: "sk1",
    name: "Aarav Studio",
    service: "Product & Pre-Wedding Photography",
    location: "Station Road, Banda",
    rating: 4.9,
    startingAt: 2499,
    imageKey: "skill-photographer",
    tag: "Photographer",
    distanceKm: 1.4,
  },
  {
    id: "sk2",
    name: "Banda Web Solutions",
    service: "Website & App Development for Shops",
    location: "Civil Lines, Banda",
    rating: 4.8,
    startingAt: 4999,
    imageKey: "skill-developer",
    tag: "Developer",
    distanceKm: 2.6,
  },
  {
    id: "sk3",
    name: "Ansari Laptop Care",
    service: "Laptop & Mobile Repair, Data Recovery",
    location: "Chowk Bazaar, Banda",
    rating: 4.7,
    startingAt: 299,
    imageKey: "skill-repair",
    tag: "Repair",
    distanceKm: 0.7,
  },
];

export const faqs = [
  {
    q: "Kya shop wale se zyada paisa lagega? (Overcharging policy)",
    a: "Bilkul nahi. Har item par printed MRP se kam ya barabar price hota hai. Rider extra cash nahi maang sakta — agar maange to order screen se report karein, poora amount wallet me wapas.",
  },
  {
    q: "7-Day Warranty kaise kaam karti hai?",
    a: "Grocery, electronics aur repair services par 7 din ka return/replacement. App ke My Orders me jaakar 'Report Issue' dabaiye, 24 ghante me pickup ya dobara visit free.",
  },
  {
    q: "Free delivery kab milti hai?",
    a: "₹149 se upar ke order par delivery bilkul free. ₹100 se kam ke order par ₹15 aur express (15 min) delivery par ₹25 lagta hai.",
  },
  {
    q: "Mini-ATM (ghar par cash) kaise milta hai?",
    a: "₹500 se ₹5,000 tak cash request kijiye, ₹20 convenience fee. Rider aapke ghar OTP verify karke cash deta hai aur amount aapke wallet/UPI se cut hota hai.",
  },
  {
    q: "Local Bites me rider stall se kaise laata hai?",
    a: "Zero-tech stalls ke liye rider khud stall par cash/UPI pay karta hai aur 20-30 min me aapko deliver karta hai. Aap app me hi pay karte hain.",
  },
];


/** Items each local shop sells — used by the shop detail page. */
export type ShopItem = {
  id: string;
  name: string;
  hindi: string;
  price: number;
  mrp?: number;
  unit: string;
  unitHindi: string;
  imageKey: string;
};

export const shopMenus: Record<string, ShopItem[]> = {
  sh1: [
    { id: "sh1-gulab", name: "Gulab Jamun (250 g)", hindi: "गुलाब जामुन (250 ग्राम)", price: 90, mrp: 110, unit: "250 g box", unitHindi: "250 ग्राम डिब्बा", imageKey: "grocery-sugar" },
    { id: "sh1-peda", name: "Desi Peda (250 g)", hindi: "देसी पेड़ा (250 ग्राम)", price: 120, mrp: 140, unit: "250 g box", unitHindi: "250 ग्राम डिब्बा", imageKey: "grocery-ghee" },
    { id: "sh1-cake", name: "Fresh Cream Cake (500 g)", hindi: "फ्रेश क्रीम केक (500 ग्राम)", price: 340, mrp: 400, unit: "500 g", unitHindi: "500 ग्राम", imageKey: "grocery-butter" },
    { id: "sh1-rusk", name: "Bakery Rusk", hindi: "बेकरी रस्क", price: 45, mrp: 55, unit: "300 g pack", unitHindi: "300 ग्राम पैक", imageKey: "grocery-biscuits" },
  ],
  sh2: [
    { id: "sh2-soap", name: "Bathing Soap (pack of 3)", hindi: "नहाने का साबुन (3 का पैक)", price: 105, mrp: 130, unit: "3 x 100 g", unitHindi: "3 x 100 ग्राम", imageKey: "grocery-salt" },
    { id: "sh2-shampoo", name: "Shampoo Bottle", hindi: "शैम्पू बोतल", price: 175, mrp: 210, unit: "340 ml", unitHindi: "340 मि.ली.", imageKey: "grocery-mustard-oil" },
    { id: "sh2-detergent", name: "Detergent Powder", hindi: "डिटर्जेंट पाउडर", price: 210, mrp: 250, unit: "1 kg", unitHindi: "1 किलो", imageKey: "grocery-atta" },
    { id: "sh2-cream", name: "Face Cream", hindi: "फेस क्रीम", price: 99, mrp: 125, unit: "50 g", unitHindi: "50 ग्राम", imageKey: "grocery-butter" },
  ],
  sh3: [
    { id: "sh3-notebook", name: "Notebook (pack of 5)", hindi: "कॉपी (5 का पैक)", price: 160, mrp: 200, unit: "5 x 100 pages", unitHindi: "5 x 100 पेज", imageKey: "grocery-biscuits" },
    { id: "sh3-pen", name: "Gel Pen (pack of 10)", hindi: "जेल पेन (10 का पैक)", price: 90, mrp: 110, unit: "10 pcs", unitHindi: "10 पीस", imageKey: "grocery-namkeen" },
    { id: "sh3-notes", name: "UP Board Exam Notes", hindi: "यूपी बोर्ड एग्ज़ाम नोट्स", price: 220, mrp: 260, unit: "1 set", unitHindi: "1 सेट", imageKey: "grocery-tea" },
  ],
};

// ================= Food Club / Banda Market / Banda Runner =================

/** Food Club extra fees on top of item prices. Street food keeps FEES.streetDelivery/stallPickupExtra. */
export const FOOD_FEES = {
  /** Flat platform fee charged when a Food Club cart has premium restaurant items. */
  platformFee: 9,
  /** Flat delivery for premium restaurant orders. */
  restaurantDelivery: 29,
};

export type RunnerStep = {
  /** "pickup" | "drop" | "errand" */
  type: "pickup" | "drop" | "errand";
  address: string;
  note: string;
  /** km from the previous point (0 for the first step). */
  km: number;
};

export const RUNNER_FEES = {
  baseFee: 25,
  perKm: 12,
  /** Free stops included; every extra step beyond 2 costs this much. */
  freeStopCount: 2,
  extraStop: 10,
  minFee: 40,
};

export function runnerQuote(steps: RunnerStep[]) {
  if (steps.length === 0) return { totalKm: 0, fee: 0, extraStopFee: 0 };
  const totalKm = steps.reduce((s, x) => s + Math.max(0, Number(x.km) || 0), 0);
  const extraStopFee = Math.max(0, steps.length - RUNNER_FEES.freeStopCount) * RUNNER_FEES.extraStop;
  const fee = Math.max(RUNNER_FEES.minFee, Math.round(RUNNER_FEES.baseFee + totalKm * RUNNER_FEES.perKm + extraStopFee));
  return { totalKm, fee, extraStopFee };
}

export type DeliverySlot = {
  id: "instant" | "evening" | "tomorrow";
  en: string;
  hi: string;
  subEn: string;
  subHi: string;
};

/** Market checkout slots. "instant" = immediate express; others consolidate the whole Market cart into ONE delivery. */
export const deliverySlots: DeliverySlot[] = [
  { id: "instant", en: "Instant Express (15 min)", hi: "तुरंत एक्सप्रेस (15 मिनट)", subEn: "Immediate dispatch · express charge", subHi: "तुरंत रवाना · एक्सप्रेस चार्ज" },
  { id: "evening", en: "Evening Batch (4-8 PM)", hi: "शाम की बैच (4-8 बजे)", subEn: "All shops combined · ONE delivery", subHi: "सभी दुकानें एक साथ · एक ही डिलीवरी" },
  { id: "tomorrow", en: "Tomorrow Morning", hi: "कल सुबह", subEn: "All shops combined · ONE delivery", subHi: "सभी दुकानें एक साथ · एक ही डिलीवरी" },
];

/** Loose, open-measured grocery (per-kg pricing with custom weight). */
export type LooseItem = {
  id: string;
  name: string;
  hindi: string;
  perKg: number;
  mrpPerKg?: number;
  imageKey: string;
  minGrams: number;
  maxGrams: number;
  stepGrams: number;
  category: "oils-ghee" | "rice-dal" | "tea-sugar" | "atta";
};

export const looseItems: LooseItem[] = [
  { id: "loose-mustard", name: "Mustard Oil (loose)", hindi: "खुला सरसों तेल", perKg: 155, mrpPerKg: 185, imageKey: "grocery-mustard-oil", minGrams: 250, maxGrams: 5000, stepGrams: 250, category: "oils-ghee" },
  { id: "loose-ghee", name: "Desi Ghee (loose)", hindi: "खुला देसी घी", perKg: 640, mrpPerKg: 720, imageKey: "grocery-ghee", minGrams: 250, maxGrams: 5000, stepGrams: 250, category: "oils-ghee" },
  { id: "loose-arhar", name: "Arhar Dal (loose)", hindi: "खुली अरहर दाल", perKg: 148, mrpPerKg: 175, imageKey: "grocery-pulses", minGrams: 250, maxGrams: 10000, stepGrams: 250, category: "rice-dal" },
  { id: "loose-chana", name: "Chana Dal (loose)", hindi: "खुली चना दाल", perKg: 92, mrpPerKg: 110, imageKey: "grocery-pulses", minGrams: 250, maxGrams: 10000, stepGrams: 250, category: "rice-dal" },
  { id: "loose-rice", name: "Loose Rice", hindi: "खुला चावल", perKg: 58, mrpPerKg: 65, imageKey: "grocery-rice", minGrams: 250, maxGrams: 10000, stepGrams: 500, category: "rice-dal" },
  { id: "loose-sugar", name: "Loose Sugar (Cheeni)", hindi: "खुली चीनी", perKg: 44, mrpPerKg: 48, imageKey: "grocery-sugar", minGrams: 250, maxGrams: 10000, stepGrams: 500, category: "tea-sugar" },
  { id: "loose-atta", name: "Loose Atta (Chakki)", hindi: "खुला आटा", perKg: 38, mrpPerKg: 45, imageKey: "grocery-atta", minGrams: 1000, maxGrams: 10000, stepGrams: 500, category: "atta" },
];

export type RestaurantDish = {
  id: string;
  name: string;
  hindi: string;
  price: number;
  veg: boolean;
  desc: string;
  imageKey: string;
  bestseller?: boolean;
};

export type Restaurant = {
  id: string;
  name: string;
  nameHindi: string;
  cuisine: string;
  cuisineHindi: string;
  location: string;
  locationHindi: string;
  rating: number;
  eta: string;
  imageKey: string;
  pureVeg: boolean;
  menu: RestaurantDish[];
};

export const restaurants: Restaurant[] = [
  {
    id: "rest-anand",
    name: "Anand Family Restaurant",
    nameHindi: "आनंद फैमिली रेस्टोरेंट",
    cuisine: "North Indian • Thali • Sweets",
    cuisineHindi: "नॉर्थ इंडियन • थाली • मिठाई",
    location: "Station Road, Banda",
    locationHindi: "स्टेशन रोड, बांदा",
    rating: 4.6,
    eta: "30-40 min",
    imageKey: "restaurant-anand",
    pureVeg: true,
    menu: [
      { id: "anand-thali", name: "Special Veg Thali", hindi: "स्पेशल वेज थाली", price: 180, veg: true, desc: "Paneer, dal, rice, 2 naan, salad, sweet.", imageKey: "restaurant-anand", bestseller: true },
      { id: "anand-paneer", name: "Shahi Paneer + 2 Naan", hindi: "शाही पनीर + 2 नान", price: 220, veg: true, desc: "Creamy cashew paneer gravy.", imageKey: "restaurant-anand" },
      { id: "anand-dal", name: "Dal Tadka + Jeera Rice", hindi: "दाल तड़का + जीरा राइस", price: 150, veg: true, desc: "Ghee tadka dal with jeera rice.", imageKey: "restaurant-anand" },
      { id: "anand-chole", name: "Chole Bhature (2 pc)", hindi: "छोले भटूरे (2 पीस)", price: 110, veg: true, desc: "Fluffy bhature with amritsari chole.", imageKey: "restaurant-anand" },
    ],
  },
  {
    id: "rest-zaika",
    name: "Zaika Kitchen",
    nameHindi: "ज़ायका किचन",
    cuisine: "Biryani • Indo-Chinese",
    cuisineHindi: "बिरयानी • इंडो-चाइनीज़",
    location: "Civil Lines, Banda",
    locationHindi: "सिविल लाइंस, बांदा",
    rating: 4.7,
    eta: "35-45 min",
    imageKey: "restaurant-zaika",
    pureVeg: false,
    menu: [
      { id: "zaika-chicken-biryani", name: "Chicken Biryani", hindi: "चिकन बिरयानी", price: 189, veg: false, desc: "Handi biryani with raita and egg.", imageKey: "restaurant-zaika", bestseller: true },
      { id: "zaika-paneer-biryani", name: "Paneer Biryani", hindi: "पनीर बिरयानी", price: 169, veg: true, desc: "Dum paneer biryani with raita.", imageKey: "restaurant-zaika" },
      { id: "zaika-noodles", name: "Hakka Veg Noodles", hindi: "हक्का वेज नूडल्स", price: 110, veg: true, desc: "Wok-tossed noodles with veggies.", imageKey: "restaurant-zaika" },
      { id: "zaika-chilli-paneer", name: "Chilli Paneer (dry)", hindi: "चिली पनीर (ड्राई)", price: 190, veg: true, desc: "Spicy chilli-garlic paneer.", imageKey: "restaurant-zaika" },
    ],
  },
];
