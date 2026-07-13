# Kondo UI Tweaks

## Logo Variants

`KondoLogo` supports three variants:

- `variant="full"`: symbol, wordmark, and tagline.
- `variant="wordmark"`: symbol and wordmark only.
- `variant="mark"`: symbol only.

The component also supports `size="sm"`, `size="md"`, `size="lg"`, and `size="xl"`.

## Tagline Visibility

The tagline is intentionally hidden on:

- Login page
- Register page
- Sender dashboard
- Admin dashboard
- Navbar
- Admin sidebar
- Transfer pages

The tagline is only used on marketing surfaces where it helps the brand presentation:

- Landing page hero card
- Landing page footer
- Future large marketing sections

## Hero Background Behavior

The landing page hero uses a premium Kondo-colored layered background:

- Navy and bright blue gradient overlay
- Optional image layer
- Soft blue and white abstract finance-style shapes
- Light grid texture on desktop

Text remains white and readable on desktop, tablet, and mobile.

## Hero Slider Behavior

The landing hero includes a lightweight React state slider:

- Auto-rotates every 4.5 seconds.
- Includes dot indicators.
- Allows manual dot selection.
- Uses no new dependency.
- Keeps the main SEO headline static on the page.

Slides:

- Envoyez du FCFA vers le Yuan
- Payez avec Orange Money ou MTN
- Bénéficiaire payé via Alipay

## Beneficiary Validation Changes

The transfer beneficiary step now includes:

- Beneficiary name validation with letters, spaces, apostrophes, and hyphens.
- Rejection of number-only names.
- Beneficiary country dropdown with China, Cameroon, Hong Kong, Macao, and Taiwan.
- Country code helper text.
- Digit-only phone entry.
- Alipay ID helper text and minimum 4-character validation.
- Dangerous character stripping for flexible text fields.
- Optional purpose/reference capped at 140 characters.

Backend Zod validation was updated safely without changing the database schema or transfer business logic.

## Replacing The Hero Image

To use a real hero background, place an optimized image at:

```text
public/kondo-hero-bg.jpg
```

The hero already references this path and keeps the gradient overlay for readability. If the image is absent, the CSS gradient and abstract background still render.

## Replacing The Real Logo

To replace the logo, overwrite:

```text
public/kondo-logo.png
```

All `KondoLogo` variants will use the new asset automatically.
