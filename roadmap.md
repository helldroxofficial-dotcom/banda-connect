# Banda Bazaar launch roadmap

- [x] Stabilize Grocery loading and empty/error states
- [x] Repair Google sign-in callback flow and configure provider (Google already enabled on backend)
- [x] Add live-location map preview and verified address submission
- [x] Add admin and seller review screens plus delivery partner application
- [x] Add seller listing submission and admin review flow
- [x] Add secure rider assignment and delivery job/status flow (delivery_jobs table, rider claim/status UI, admin "Send to delivery")
- [x] Add configurable merchant UPI intent handoff in checkout
- [x] Add Firebase phone OTP client flow and server-side ID-token verification
- [x] Keep Google sign-in brokered, use a public same-origin return URL and request account selection
- [ ] Configure Firebase project settings and authorized domains; verify SMS eligibility and pricing
- [ ] Verify auth, map, seller, admin and rider flows end-to-end in the hosted preview (needs a signed-in test session)
- [ ] Complete provider setup and production launch checklist (SMS OTP provider, payments, maps usage limits)
