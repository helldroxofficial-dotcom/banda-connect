# Banda SuperApp

Act as a Senior Full-Stack AI Engineer & Lead UX Architect. Build a complete, production-ready Hyper-Local Super App for "Banda, Uttar Pradesh" from scratch using React, Tailwind CSS, Lucide Icons, and Supabase integration.



---



🎨 1. DESIGN SYSTEM & COLOR THEME



- Primary Theme: Vibrant Emerald Green (`#059669` / `#10B981`) & Warm Amber/Yellow (`#F59E0B`) accent for food & delivery highlights (Zepto/Blinkit inspired clean dark/light UI).



- Typography & Feel: Fast loading, rounded modern card layout, compact mobile-first responsive layout with smooth transitions.



---



🌐 2. GLOBAL HEADER & TOP CONTROLS



- Location Selector: Pinpoint header showing "Delivering to: Station Road, Banda" (with area picker modal: Civil Lines, Degree College, Kalu Kuan, Mahaviriran, Nawalabad).



- Global Search Bar: Real-time instant search across Groceries, Food, Shops, and Home Services.



- Header Actions: Language Switcher Toggle (हिंदी / ENG), Notification Bell, and Cart Icon with dynamic counter badge.



---



📱 3. BOTTOM NAVIGATION STRUCTURE (5 PRIMARY TABS)



TAB 1: 🏠 Home



- Hero Carousel Banner: "Banda's #1 Daily Super App - 15 Min Delivery".



- AI Local Assistant Badge: "Banda AI Help" - Free voice/text assistant asking "Aaj kya chahiye? (e.g., Aata, Electrician, or Samosa)".



- Mini-ATM Request Tile: Order cash at home (₹500 to ₹5,000) for ₹20 convenience fee, verified via OTP on delivery.



- Interactive Buyer's Guide Banner: "Why Use Banda App?" (0 Overcharging, 7-Day Warranty, Free Delivery > ₹149).



- Quick Category Shortcuts Grid.



TAB 2: 🛒 Market & Orders (High-Frequency Ordering)



Horizontal Segmented Pills at top:



1. Groceries (Blinkit Style Category Sidebar + Deep Listing):



   - Aata & Flours: Fortune Chakki Atta 5kg, Ashirvaad Atta 10kg, Maida 1kg, Sooji 500g, Besan 1kg.



   - Rice & Dals: Basmati Rice 5kg, Arhar/Toor Dal 1kg, Chana Dal 1kg, Moong Dal 1kg, Kabuli Chana.



   - Oils & Ghee: Fortune Mustard Oil 1L, Safola Gold Refined 1L, Amul Pure Ghee 1L, Engine Kachi Ghani 1L.



   - Spices & Cooking: Everest Garam Masala, Rajesh Masala Pack, Tata Salt 1kg, Haldi 200g, Mirch Powder, Dhaniya Powder.



   - Tea & Sugar: Red Label Tea 250g, Tata Tea Gold, Premium Sugar 1kg, Jaggery/Gud 1kg.



   - Each card features High-Res Unsplash images, MRP vs Discounted Price, Buffer Margin, and +ADD button with quantity counter.



2. Local Bites / Food (Dual-Model System):



   - Model A (Partnered Stalls): Digital Menu flow for tech-enabled restaurants.



   - Model B (Rider Direct Pick-up - Zero-Tech Vendor): Famous Banda stalls (e.g., Kalu Kuan Famous Chaat, Railway Station Samosa, Chowk Lassi). Prominent "Live Stall Pickup" badge (20-30 mins ETA) where rider pays cash/UPI at stall.



3. Local Famous Shops: Sweets (Gulab Jamun, Peda), Bakeries, Clothing, and Cosmetics from Banda local market.



TAB 3: 🛠️ Services & Rentals



Sub-tabs with Dual-Sided Posting Modal ("🟢 Post Your Need" for Customers vs "🔵 List Service/Room" for Providers) + Filter & Sort Bar (By Distance, Price, Rating):



- Local Trades (Fix Pricing logic - ₹39 Inspection Fee): Plumber, Electrician, Bike Mechanic, Carpenter. (Includes "Customer Feedback Reel Preview" button popping up a vertical Instagram-Reels style video review modal).



- Healthcare & Lab Checkups: DMLT Certified Phlebotomist home sample collection, Doctor clinic tokens/home visits, Safety Disclaimer Badge.



- Rent & Rooms: 1BHK/2BHK, Student Single Rooms near Degree College, Tenant demand posts.



- Home Tutors & Skill Nerds: Maths/Science Tutors, SSC CGL Coaching, Product Photographers, Web Developers, Laptop Repair.



TAB 4: 📦 My Orders & Support



- Order History & Active Tracking: Step-by-step animated rider tracking simulation (Order Placed ➔ Rider Assigned ➔ Delivery Complete).



- Automated QR Feedback: Rider Bike Vinyl QR Code preview + 5-Star mandatory feedback modal popup post-delivery.



- Interactive FAQ Accordion & Live Support: Pre-set answers for overcharging policy, 7-day warranty, and free delivery thresholds.



TAB 5: 👤 Profile & Admin Mode Toggle



- Profile management, addresses, wallet balance, transaction history.



- Admin Control Panel (Protected Role):



  - Live Order Dispatch Monitor (Assign Rider, Change Order Status).



  - Manage Product Listings (Add/Edit items, adjust inventory, set reseller margins).



  - Vendor & Service Provider Approval Requests.



  - Commission & Mini-ATM Requests tracker.



---



💳 4. CART, CHECKOUT & PRICING LOGIC



- Floating Bottom Cart Bar: Appears dynamically when items > 0 with pulse animation.



- Checkout Breakdown:



  - Item Total (inclusive of silent logistics buffer)



  - Eco & Safety Packaging Fee: ₹5



  - Dynamic Delivery Fee: FREE on orders ≥ ₹149, ₹15 for small orders (< ₹100), ₹25 Express Delivery.



  - Total Savings Badge: "You saved ₹30 on delivery!"



  - Payment Options: Mock UPI (PhonePe/Google Pay QR simulation) & Cash on Delivery.



  - Policy Badges: "7-Day Return/Replacement Guarantee" and "Instant Cancellation Notice".



---



⚡ 5. TECHNICAL & DATABASE INSTRUCTIONS FOR LOVABLE



- Setup Supabase tables: `users`, `products`, `categories`, `orders`, `service_listings`, `demand_posts`, `mini_atm_requests`.



- Enable Role-Based Access Control (RBAC) for Admin features.



- Ensure 0 console errors, lightweight UI, responsive mobile design, and fast image rendering via CDN placeholders.



and also add all important and modern or cool useful next generation features which i missed



Aur haa maine images hata di hai upar ki zip se



But image attach kari hai dekh lena usme jo hain images waisi hi images lagana 



aur maine apna pahle wala app jo banaya tha uski hi zip add kari hai, mujhe bas isi app ka better version chahiye tumse jo kamiya erorrs hain dur karke aur apne new bataye features jod kar, sab work karne chahiye



Jo zip hai wo versel se banaya app ki hai aur ek html file add kari hai wo claud se banaye app ki hai sab kuch samjh lo or bina error ke banao, aur ek baat app ka color theme versel wale jaisa hi rkhna hai

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://banda-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ff43c564-50bf-492d-a11f-7c625fecb34e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
