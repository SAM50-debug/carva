---
name: vercel-best-practices
description: >-
  Use this skill to apply Vercel and Next.js best practices when writing or refactoring code.
---

# Vercel Best Practices

When working on this project, adhere to the following Vercel and Next.js best practices:

1.  **Use Next.js Image Component**: Always use `next/image` for images to ensure automatic optimization.
2.  **App Router**: Use the Next.js App Router (`app/` directory) for new pages and components.
3.  **Server Components**: Default to Server Components for faster page loads. Only use `use client` when interactivity is required.
4.  **Edge Functions**: Prefer Edge runtime for API routes where possible for lower latency.
5.  **Caching**: Utilize Next.js caching strategies (e.g., `fetch` cache, `revalidate`) effectively.
6.  **Vercel Analytics**: Ensure Vercel Analytics and Speed Insights are integrated if applicable.
7.  **Environment Variables**: Manage sensitive keys securely via `.env.local` and never expose them to the client unless prefixed with `NEXT_PUBLIC_`.
