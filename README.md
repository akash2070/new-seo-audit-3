# Professional SEO Analysis Platform

A comprehensive SEO auditing platform with advanced analytics, competitor analysis, keyword research, and bulk URL processing capabilities.

## Features

- **Instant SEO Audits**: Lightning-fast comprehensive website analysis using Google PageSpeed Insights API
- **Analytics Dashboard**: Track performance trends across multiple websites with historical data
- **Keyword Analysis**: Advanced content quality metrics, readability scoring, and keyword optimization
- **Competitor Analysis**: Side-by-side performance comparison with industry benchmarking
- **Bulk URL Processing**: Analyze hundreds of URLs simultaneously with CSV import/export
- **Professional PDF Reports**: Comprehensive audit reports with actionable recommendations

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: In-memory storage (easily extensible to PostgreSQL)
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF with HTML2Canvas
- **API Integration**: Google PageSpeed Insights API

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google PageSpeed Insights API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd seo-analysis-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Add your Google PageSpeed Insights API key to `.env`:
```
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5000 in your browser

### Production Build

```bash
npm run build
npm start
```

## Railway Deployment

This project is optimized for Railway deployment:

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Deploy:
```bash
railway up
```

4. Set environment variables in Railway dashboard:
   - `GOOGLE_PAGESPEED_API_KEY`: Your Google PageSpeed Insights API key
   - `NODE_ENV`: production

## Environment Variables

- `GOOGLE_PAGESPEED_API_KEY`: Required for SEO audits
- `NODE_ENV`: development | production
- `PORT`: Server port (default: 5000)

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and types
│   │   └── hooks/         # Custom React hooks
│   └── public/           # Static assets
├── server/               # Express backend
│   ├── index.ts         # Main server file
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage layer
│   └── vite.ts          # Vite integration
├── shared/              # Shared types and schemas
└── components.json      # Shadcn/ui configuration
```

## API Endpoints

- `POST /api/audit` - Run SEO audit for single URL
- `GET /api/websites` - Get user websites
- `GET /api/dashboard/stats` - Get dashboard statistics
- `POST /api/competitors/analyze` - Analyze competitor websites
- `POST /api/audit/bulk` - Start bulk URL analysis

## SEO Features

### Core Auditing
- Performance analysis (Core Web Vitals)
- Accessibility compliance checking
- SEO best practices validation
- Technical SEO analysis
- Meta tags optimization
- Heading structure analysis

### Advanced Analytics
- Historical performance tracking
- Multi-website management
- Score trend visualization
- Improvement recommendations
- Industry benchmarking

### Professional Tools
- Competitor comparison matrices
- Keyword density analysis
- Content quality metrics
- Bulk URL processing
- CSV import/export
- PDF report generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@seoplatform.com or create an issue on GitHub.