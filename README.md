# ☁️ SkyWatch — Weather Monitoring App

A weather monitoring web app built with **React + Vite**, ready to deploy on **Vercel** from **GitHub**.
Weather data comes from [Open-Meteo](https://open-meteo.com). It's free and needs **no API key**.

## Features

- **Location:** search any city, use your current location, and save favourites
- **Dashboard:** temperature, feels like, humidity, wind (speed and direction), pressure, UV index, visibility, rainfall, sunrise and sunset, plus a colour-coded **Air Quality Index**
- **Forecast:** a scrollable 48-hour strip, a temperature and rain-chance chart, and a 7-day forecast
- **Alerts:** your own rules (temperature, rain chance, wind, AQI, UV) for each saved location, with browser notifications and an alert history
- **Compare:** current conditions for all saved locations side by side
- **Settings:** °C/°F, km/h or mph, light or dark theme, and a default location
- Background tint that follows the weather (sunny, cloudy, rain, storm, snow, night)
- Auto-refresh every 15 minutes, a 10-minute response cache, and an offline mode that shows the last saved data

## Run locally

Requires **Node.js 18+** ([download](https://nodejs.org)).

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

To test the production build: `npm run build`, then `npm run preview`.

## Deploy: GitHub → Vercel

**1. Push the code to GitHub**

Create an empty repository on github.com (for example `skywatch`). Then, inside this folder, run:

```bash
git init
git add .
git commit -m "Initial commit: SkyWatch weather app"
git branch -M main
git remote add origin https://github.com/<your-username>/skywatch.git
git push -u origin main
```

**2. Import it into Vercel**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**, then **Import** your `skywatch` repository.
3. Vercel detects **Vite** automatically (build command `npm run build`, output directory `dist`). You don't need any environment variables.
4. Click **Deploy**. In about a minute you get a live URL such as `skywatch-xyz.vercel.app`.

**3. Updating**

Every `git push` to `main` redeploys the site automatically.

## How to use alerts

1. Search for a city and click **☆ Save**.
2. Go to **Alerts**, then choose the location, the measure (for example *Temperature*), *above* or *below*, and a threshold.
3. Click **Enable notifications** and allow them when your browser asks.
4. The rules are checked every time the weather refreshes. A triggered rule shows a red badge on the Alerts tab, appears on the dashboard, sends a browser notification, and is added to the history. Each rule notifies **once per day**.

## Limitations

- **Notifications only work while SkyWatch is open** in a browser tab (it can be in the background). There's no server checking the weather while the app is closed.
- **Data is stored per browser and per device** (localStorage). Saved locations and rules on your laptop won't appear on your phone. Clearing your browser data erases them.
- "Use my location" needs HTTPS (Vercel provides it) and your permission. The location shows as "My location", because Open-Meteo has no reverse geocoding.
- Air quality data isn't available for some remote locations. The AQI tile then shows "Not available".

## Project structure

```
skywatch/
├── index.html
├── package.json
├── vercel.json             # Vercel build settings
├── vite.config.js
├── public/favicon.svg
└── src/
    ├── main.jsx            # entry point
    ├── App.jsx             # layout, navigation, app state
    ├── styles.css          # all styles (themes, weather tints, responsive)
    ├── components/
    │   ├── LocationBar.jsx     # city search, my location, saved chips
    │   ├── Dashboard.jsx       # current conditions + AQI
    │   ├── Forecast.jsx        # 48-hour strip + 7-day list
    │   ├── ForecastChart.jsx   # Recharts temperature/rain chart
    │   ├── Alerts.jsx          # rules, active alerts, history
    │   ├── Compare.jsx         # side-by-side saved locations
    │   ├── Settings.jsx        # units, theme, default location
    │   └── StatusMessage.jsx   # loading / empty / error states
    ├── hooks/
    │   ├── useLocalStorage.js  # state that persists in the browser
    │   ├── useWeatherStore.js  # loads + auto-refreshes weather
    │   ├── useAlerts.js        # alert rules, checks, notifications
    │   └── useOnline.js        # online/offline detection
    └── utils/
        ├── api.js              # Open-Meteo calls + 10-min cache
        ├── weatherCodes.js     # weather code → label, icon, tint
        ├── aqi.js              # AQI levels and colours
        ├── units.js            # unit conversion + formatting
        └── storage.js          # safe localStorage helpers
```

## Customising

- **Add a new alert type:** add an entry to `METRICS` in `src/hooks/useAlerts.js`.
- **Change the refresh interval:** `AUTO_REFRESH` in `src/hooks/useWeatherStore.js`.
- **Change the cache time:** `CACHE_TTL` in `src/utils/api.js`.
- **Change colours:** the CSS variables at the top of `src/styles.css`.
