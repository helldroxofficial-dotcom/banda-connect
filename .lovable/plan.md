# Banda Bazaar launch-ready foundation

## User-visible outcome

Customers can reliably open Grocery, sign in with Google, verify a delivery address with live location and see it on a map. Admins manage the catalogue and incoming submissions, shop owners can submit listings for review, and delivery partners can see assigned work and update statuses.

## Workstreams

1. **Customer reliability**
   - Make Grocery show loading, empty, and retry states instead of appearing broken when the catalogue request is delayed or fails.
   - Add an address map preview using the verified browser coordinates, with a clear unverified state before submission.
   - Keep phone OTP and live-location verification required before saving a delivery address.

2. **Google sign-in**
   - Preserve the existing Lovable Google broker integration and return to a public callback before navigating into the signed-in app.
   - Configure the Google provider so the button is enabled for launch.
   - Show a useful in-app error when the provider or callback is unavailable.

3. **Operations workspace**
   - Extend the existing admin area with sections for catalogue, orders, seller listing approvals, and delivery operations.
   - Add separate role-aware seller and delivery views inside the same app, keeping admin authorization server-backed through the existing roles table.
   - Add database-backed seller listings and delivery partner/job records with RLS, grants, and admin-controlled status changes.

4. **Seller onboarding**
   - Add a “List your business” flow where an authenticated shop owner submits business name, category, contact, address, service area, and description.
   - Keep submissions pending until an admin approves them; public customer views only show approved listings.

5. **Delivery workflow**
   - Add a delivery partner profile/application flow and a delivery task list for assigned orders or cash requests.
   - Support status updates such as available, accepted, picked up, and delivered, while preventing arbitrary users from changing another partner’s tasks.

## Technical details

- Use the existing TanStack Start routes, Supabase browser client, and role table; do not add a second router or client-side admin check.
- Apply all schema changes through a migration with explicit grants immediately after each public table creation, RLS, and policies.
- Keep customer, seller, delivery, and admin surfaces as named routes in the existing app so navigation remains stable.
- Use the existing design tokens and bilingual `t()` pattern; no new hardcoded theme palette.
- Validate Grocery, auth, map, seller submission, admin review, and delivery status flows in the live preview, then run the project build.

## Launch checklist shown to the user

- Auth provider and email confirmation settings
- SMS provider for phone OTP
- Maps/geocoding provider decision and usage limits
- Payment gateway and webhook verification
- Delivery partner onboarding, KYC, payouts, and support process
- Catalogue, service-area, pricing, cancellation, refund, privacy, and terms content
- Production monitoring, backups, rate limits, and abuse reporting
