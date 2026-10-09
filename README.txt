========================================================================
ELECTION OPERATIONS & FIELD MANAGEMENT SYSTEM
Gokarneshwor Municipality (9-Ward Pilot) • Full Multi-Tenant Scaling
========================================================================

1. LOCALHOST RUNNING URL
------------------------------------------------------------------------
The local server is already running and live on your machine at:

   👉 http://localhost:3000

To open or restart it manually at any time:
- Double click 'start.bat' inside this directory, OR
- Run: node server.mjs

2. LOGIN CREDENTIALS
------------------------------------------------------------------------
A. ADMIN LOGIN:
   - URL: http://localhost:3000
   - PIN: 1234
   - Keypad: Click numbers 1, 2, 3, 4 then click 'Unlock Dashboard'
   - Emergency Reset: If you ever change the PIN and forget it, click
     'Forgot / Reset Admin PIN to 1234' on the login screen.

B. STAFF PERSONAL LINK LOGIN:
   - URL: http://localhost:3000?u=tok_ram_w5
   - Greets: "Welcome, Ram Bahadur • Field Worker • Ward 5"
   - PIN: 1234
   - Generates QR code for each staff member under 'Team & Workers' tab.

C. PUBLIC VOTER UPDATE FORM:
   - URL: http://localhost:3000?public=1
   - Ward 5 Specific QR Link: http://localhost:3000?public=1&ward=5

3. DEPLOYING TO VERCEL (ZERO BUILD STEP)
------------------------------------------------------------------------
This project is 100% Vercel-ready with vercel.json included:
1. Push this folder to GitHub, or use the Vercel CLI:
      npx vercel
2. Vercel will immediately deploy the static web application.

4. CONNECTING REAL SUPABASE DATABASE
------------------------------------------------------------------------
1. Go to your Supabase project (https://supabase.com).
2. Open the SQL Editor and run the script in:
      supabase/schema.sql
3. In the application UI, go to 'Settings & Supabase' tab.
4. Paste your Supabase URL and Anon Key and click 'Save & Connect'.

5. GOOGLE APPS SCRIPT BACKEND
------------------------------------------------------------------------
If you also want to run this backend directly inside Google Sheets:
- Copy the code from 'Code.gs' into your Apps Script editor.
========================================================================
