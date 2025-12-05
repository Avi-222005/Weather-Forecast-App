# SkyCast - Weather Forecast App 🌤️

A modern, responsive weather application with real-time forecasts, air quality monitoring, search history, and saved locations.

**Live Demo:** [Deploy on Vercel](https://vercel.com)

## 🌟 Features

- **Real-time Weather Data**: Current conditions, weekly forecasts, wind speed/direction, and day/night indicator
- **Air Quality Index (AQI)**: Live US AQI with color-coded severity levels
- **User Authentication**: Secure login/signup via Supabase Auth
- **Saved Locations**: Save favorite cities with custom labels (Home, Office, etc.)
- **Search History**: Track your recent searches with timestamps
- **Weather News**: Contextual weather headlines from GNews API
- **Responsive Design**: Three-column layout that adapts to mobile/tablet/desktop
- **Static Gradient Background**: Clean, modern glassmorphism UI without dynamic weather effects

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **APIs**:
  - [Open-Meteo](https://open-meteo.com) - Weather & Air Quality
  - [BigDataCloud](https://www.bigdatacloud.com) - Reverse Geocoding
  - [GNews](https://gnews.io) - Weather News
- **Backend**: [Supabase](https://supabase.com) (PostgreSQL, Auth, Row Level Security)
- **Deployment**: [Vercel](https://vercel.com)

## 📦 Project Structure

```
.
├── weather forcast app.html    # Main HTML entry point
├── style.clean.css             # Responsive styles & glassmorphism
├── app.js                      # Weather logic, AQI, history, saved locations
├── auth.js                     # Supabase authentication
├── weather images/             # Local weather icons
├── vercel.json                 # Vercel deployment config
├── .gitignore                  # Git ignore patterns
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A [Supabase](https://supabase.com) account (free tier available)
- A [GNews API](https://gnews.io) key (free tier: 100 requests/day)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Avi-222005/Weather-Forecast-App.git
   cd Weather-Forecast-App
   ```

2. **Serve the files over HTTP** (required for Supabase Auth CORS)
   
   Option A - Python:
   ```bash
   python -m http.server 5500
   ```
   
   Option B - VS Code Live Server:
   - Install the "Live Server" extension
   - Right-click `weather forcast app.html` → "Open with Live Server"

3. **Configure API keys**
   
   Edit `auth.js` and update:
   ```javascript
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```
   
   Edit `app.js` and update:
   ```javascript
   const GNEWS_API_KEY = 'YOUR_GNEWS_API_KEY';
   ```

4. **Set up Supabase tables**
   
   Run this SQL in your Supabase SQL Editor:
   
   ```sql
   -- Search History table
   create table search_history (
     id bigserial primary key,
     user_id uuid references auth.users not null,
     city_name text not null,
     weather_data jsonb,
     searched_at timestamptz default now()
   );
   
   -- Saved Locations table
   create table saved_locations (
     id bigserial primary key,
     user_id uuid references auth.users not null,
     saved_city text not null check (char_length(saved_city) between 1 and 80),
     label text not null check (char_length(label) between 1 and 40),
     created_at timestamptz default now()
   );
   
   -- Enable Row Level Security
   alter table search_history enable row level security;
   alter table saved_locations enable row level security;
   
   -- RLS Policies for search_history
   create policy "Users can view own history"
     on search_history for select
     using (auth.uid() = user_id);
   
   create policy "Users can insert own history"
     on search_history for insert
     with check (auth.uid() = user_id);
   
   create policy "Users can delete own history"
     on search_history for delete
     using (auth.uid() = user_id);
   
   -- RLS Policies for saved_locations
   create policy "Users can view own saved locations"
     on saved_locations for select
     using (auth.uid() = user_id);
   
   create policy "Users can insert own saved locations"
     on saved_locations for insert
     with check (auth.uid() = user_id);
   
   create policy "Users can delete own saved locations"
     on saved_locations for delete
     using (auth.uid() = user_id);
   ```

5. **Configure Supabase Auth URLs**
   
   In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `http://localhost:5500` (or your dev server)
   - **Redirect URLs**: Add `http://localhost:5500/*` and `http://127.0.0.1:5500/*`

6. **Open the app**
   
   Navigate to `http://localhost:5500/weather%20forcast%20app.html`

## 🌐 Deploying to Vercel

### Step 1: Push to GitHub

```bash
cd "c:\Users\avina\Downloads\Web tech project - Copy"
git init
git add .
git commit -m "Initial commit: SkyCast Weather App"
git branch -M main
git remote add origin https://github.com/Avi-222005/Weather-Forecast-App.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import `Avi-222005/Weather-Forecast-App`
4. Keep default settings (Vercel auto-detects static site)
5. Click **"Deploy"**

### Step 3: Configure Production Environment

After deployment:

1. **Update Supabase URLs**
   
   In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/*`

2. **Update API keys in deployed code** (if needed)
   
   If you want to keep keys out of the repo (recommended):
   - Use Vercel's [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
   - Update your JS to read from `window.ENV` or similar

3. **Test your deployment**
   - Visit `https://your-app.vercel.app/weather%20forcast%20app.html`
   - Sign up, log in, search for weather, save locations

## 🔒 Security Considerations

- **SQL Injection**: Not applicable—using Supabase client (parameterized queries + PostgREST)
- **XSS Prevention**: All user input rendered via `textContent` (not `innerHTML`)
- **Row Level Security (RLS)**: Enforced on both `search_history` and `saved_locations`
- **Input Validation**: City names limited to 80 chars, labels to 40 chars (DB constraints)
- **HTTPS**: Vercel auto-provisions SSL certificates
- **Auth Security**: Supabase handles password hashing, session tokens, CORS

## 📸 Screenshots

> Add screenshots of your app here after deployment!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Avinash Verma**
- Email: avinash5335588@gmail.com
- GitHub: [@Avi-222005](https://github.com/Avi-222005)

## 🙏 Acknowledgments

- [Open-Meteo](https://open-meteo.com) for free weather and air quality APIs
- [Supabase](https://supabase.com) for backend and authentication
- [GNews](https://gnews.io) for news headlines
- [Vercel](https://vercel.com) for seamless deployment

---

**Note**: Remember to never commit your API keys. Keep `auth.js` and `app.js` keys in `.env` or Vercel environment variables for production.
