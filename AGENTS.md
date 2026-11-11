<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Address verification stores browser geolocation coordinates; this keeps location checks tied to device evidence rather than typed text.
- Seller and delivery applications reuse the existing service_listings workflow until a dedicated operations schema is available; this keeps admin approval server-backed without duplicating public listing data.
- Firebase phone numbers are trusted only after server-side Firebase ID-token verification; provider configuration remains external so client code never treats typed numbers as verified.
- Checkout builds merchant UPI intents from a single public configuration module so payment values can change without altering order logic.
- Keep Food, Market and Services as independent cart/checkout sections so items and fees remain unambiguous.
- Keep speech recognition behind user interaction with typed-command fallback because browser microphone support varies by device.
- Runner quotes use explicitly entered leg distances until a routing provider is configured, keeping prices transparent and deterministic.
