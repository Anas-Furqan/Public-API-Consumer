1. How to run
- `npm install`
- `cp .env.example .env.local`
- Add your OpenWeatherMap key to `.env.local`
- `npm run dev`

2. Stack choice
I chose Next.js 14 App Router + TypeScript because it provides API routes to proxy third-party requests (so the OpenWeather key never hits the browser), strong type safety, and a production-grade UI layer with Tailwind. A worse choice would be a plain HTML/JS app that calls OpenWeather directly from the browser, which would expose the API key and make error handling and data composition harder to structure.

3. One real edge case
`Promise.allSettled` in app/api/weather/route.ts line 87 ensures that if the forecast call fails or times out, the current weather still returns with a warning. Without that, a single upstream timeout would fail the entire dashboard request.

4. AI usage
- GitHub Copilot Chat (GPT-5.2-Codex): asked for a draft structure for API routes and dashboard components. I adjusted the output to add input validation, timeout handling, and warnings per route, and tightened the score panel to use normalized metrics and a count-up animation.
- GitHub Copilot Chat (GPT-5.2-Codex): asked for Recharts component scaffolds. I modified chart styling to match the dark SaaS theme and added the OpenWeather icon hostname to Next.js image config.

5. Honest gap
There is no server-side caching yet. Searching the same city 100 times triggers 100 upstream API calls. With another day, I would add Next.js revalidation or a Redis-backed cache to reduce duplicate requests and improve latency.
