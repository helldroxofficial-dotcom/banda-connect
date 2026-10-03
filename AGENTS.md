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

- Phone changes use the auth provider's OTP verification, while address verification stores browser geolocation coordinates; this keeps profile trust checks server-backed rather than client-only.
- Seller and delivery applications reuse the existing service_listings workflow until a dedicated operations schema is available; this keeps admin approval server-backed without duplicating public listing data.
