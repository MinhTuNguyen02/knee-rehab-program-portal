# Knee Rehab Program - Clinical Portal

Next.js frontend for clinic staff to view patient assessments and manage leads.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3002` to view the portal.

## Production Deployment (Render)
- Use **Web Service**.
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Set `NEXT_PUBLIC_API_URL` to your production backend URL.

## Admin Credentials
Staff must register via the API or have accounts manually seeded to log in. Emails must end in `@krps.com` (configurable via backend env).
