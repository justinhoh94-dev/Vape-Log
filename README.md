# Cannabis Journal

A progressive web application for tracking cannabis products, experiences, and finding your ideal cannabinoid and terpene profile.

## Features

- **Product Tracking**: Manage your cannabis products with detailed cannabinoid and terpene profiles
- **Journal Entries**: Log your experiences with ratings, effects, dosage, and notes
- **Smart Recommendations**: Get personalized product recommendations based on your preferences
- **OCR Label Scanning**: Use your phone camera to scan product labels and automatically extract information
- **Analytics Dashboard**: View insights about your usage patterns and preferences
- **Mobile Optimized**: Fully responsive design optimized for phone use
- **Offline Support**: All data stored locally using IndexedDB

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **IndexedDB** (via idb) - Local data persistence
- **Tesseract.js** - OCR for label scanning
- **Chart.js** - Data visualization

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to view the app.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Deployment to Netlify

This app is configured for easy deployment to Netlify:

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Log in to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Netlify will automatically detect the build settings from `netlify.toml`
6. Click "Deploy site"

### Manual Deployment

```bash
npm run build
# Then drag and drop the 'dist' folder to Netlify
```

## Usage

### Adding Products

1. Go to the Products tab
2. Click "Add Product" or use the camera icon to scan a label
3. Fill in product details including cannabinoids and terpenes
4. Save the product

### Creating Journal Entries

1. Go to the Journal tab or Home tab
2. Click "New Entry"
3. Select a product, rate your experience, and add effects
4. Include dosage and notes if desired
5. Save the entry

### Viewing Insights

1. Go to the Insights tab
2. View your usage stats, favorite effects, and ideal profile
3. Check personalized product recommendations
4. Switch between Overview, Profile, and Recommendations tabs

## Privacy

All data is stored locally on your device using IndexedDB. No data is sent to external servers. Your information remains completely private.

## License

MIT
