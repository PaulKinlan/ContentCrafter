# ContentCrafter

ContentCrafter is a powerful web application that transforms any webpage into engaging social media content. Simply provide a URL, and ContentCrafter will analyze the webpage content and generate tailored social media posts for Twitter/X, LinkedIn, BlueSky, and Mastodon using AI.

## Features

- 🌐 **URL Analysis**: Automatically scrapes and analyzes webpage content
- 🤖 **AI-Powered Content Generation**: Uses OpenAI GPT models to create engaging social media posts
- 🎨 **Dynamic Image Generation**: Generates platform-specific images using Replicate's AI models
- 📱 **Multi-Platform Support**: Creates optimized posts for Twitter/X, LinkedIn, BlueSky, and Mastodon
- 🎯 **Goal-Oriented Content**: Tailors posts based on specific goals (engagement, awareness, traffic, conversion, authority)
- 💾 **Content Storage**: Stores generated content for future reference
- 📐 **Platform-Specific Formatting**: Respects character limits and best practices for each platform
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configurable)
- **AI Services**: OpenAI API, Replicate API
- **Build Tools**: Vite, esbuild
- **Deployment**: Replit-ready configuration

## Prerequisites

Before running ContentCrafter, ensure you have:

- Node.js 20 or higher
- npm or yarn package manager
- PostgreSQL database (optional - uses in-memory storage by default)
- OpenAI API key
- Replicate API token

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PaulKinlan/ContentCrafter.git
   cd ContentCrafter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```bash
   # Required: OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Required: Replicate API Token
   REPLICATE_API_TOKEN=your_replicate_token_here
   
   # Optional: Database URL (uses in-memory storage if not provided)
   DATABASE_URL=postgresql://username:password@localhost:5432/contentcrafter
   ```

   **Getting API Keys:**
   - **OpenAI API Key**: Get it from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Replicate Token**: Get it from [Replicate](https://replicate.com/account/api-tokens)

4. **Database Setup (Optional)**
   
   If using PostgreSQL, push the database schema:
   ```bash
   npm run db:push
   ```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Mode

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

## Project Structure

```
ContentCrafter/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── types/          # TypeScript type definitions
│   └── index.html          # HTML entry point
├── server/                 # Express.js backend
│   ├── index.ts           # Main server entry point
│   ├── routes.ts          # API route definitions
│   ├── openai.ts          # OpenAI integration
│   ├── replicate.ts       # Replicate AI integration
│   ├── scraper.ts         # Web scraping functionality
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Development server setup
├── shared/                 # Shared code between client and server
│   └── schema.ts          # Database schema and validation
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── drizzle.config.ts      # Database configuration
└── .replit                # Replit deployment configuration
```

## API Endpoints

### POST `/api/analyze-url`

Analyzes a URL and generates social media content.

**Request Body:**
```json
{
  "url": "https://example.com",
  "goal": "engagement"
}
```

**Parameters:**
- `url` (string, required): The URL to analyze
- `goal` (string, optional): Content goal - one of: `"none"`, `"engagement"`, `"awareness"`, `"traffic"`, `"conversion"`, `"authority"`

**Response:**
```json
{
  "sourceContent": {
    "id": 1,
    "url": "https://example.com",
    "title": "Page Title",
    "description": "Page description",
    "content": "Scraped content...",
    "images": ["https://example.com/image.jpg"]
  },
  "posts": {
    "x": {
      "content": "Engaging Twitter post...",
      "characterCount": 240,
      "suggestedImage": "https://generated-image-url.jpg"
    },
    "linkedin": {
      "content": "Professional LinkedIn post...",
      "characterCount": 1200
    },
    "bluesky": {
      "content": "BlueSky post content...",
      "characterCount": 250
    },
    "mastodon": {
      "content": "Mastodon post content...",
      "characterCount": 450
    }
  }
}
```

## Usage

1. **Enter a URL**: Paste any webpage URL into the input field
2. **Select a Goal**: Choose your content goal (optional):
   - **None**: General content
   - **Engagement**: Focus on likes, comments, shares
   - **Awareness**: Brand or topic awareness
   - **Traffic**: Drive traffic to your website
   - **Conversion**: Encourage specific actions
   - **Authority**: Establish thought leadership
3. **Generate Content**: Click "Analyze URL" to generate posts
4. **Review Results**: View the generated posts for each platform
5. **Copy & Use**: Copy the generated content to your social media platforms

## Deployment

### Replit Deployment

This project is configured for easy deployment on Replit:

1. Import the repository to Replit
2. Set up your environment variables in Replit's Secrets tab:
   - `OPENAI_API_KEY`
   - `REPLICATE_API_TOKEN`
   - `DATABASE_URL` (optional)
3. Run the project - it will automatically install dependencies and start

### Manual Deployment

For other platforms:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform

3. **Start the production server**
   ```bash
   npm run start
   ```

The application serves both the API and frontend on port 5000.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for content generation |
| `REPLICATE_API_TOKEN` | Yes | Your Replicate API token for image generation |
| `DATABASE_URL` | No | PostgreSQL connection string (uses in-memory storage if not provided) |
| `NODE_ENV` | No | Set to `production` for production builds |

## Platform Specifications

ContentCrafter generates content optimized for each platform:

### Twitter/X
- **Character Limit**: 280 characters
- **Image Size**: 1200x675 (16:9 ratio)
- **Style**: Concise, engaging, hashtag-friendly

### LinkedIn
- **Character Limit**: 3000 characters (typically 1300 for optimal engagement)
- **Image Size**: 1200x627
- **Style**: Professional, thought-leadership focused

### BlueSky
- **Character Limit**: 300 characters
- **Image Size**: 1200x627
- **Style**: Community-focused, conversational

### Mastodon
- **Character Limit**: 500 characters
- **Image Size**: 1280x720
- **Style**: Community-oriented, detailed

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## Troubleshooting

### Common Issues

**"Cannot find type definition file for 'node'"**
- Run `npm install` to ensure all dependencies are installed

**"OpenAI API key not found"**
- Ensure `OPENAI_API_KEY` is set in your environment variables

**"Replicate authentication failed"**
- Verify your `REPLICATE_API_TOKEN` is correct and active

**Database connection issues**
- Check your `DATABASE_URL` format
- Ensure PostgreSQL is running (if using database)
- The app will fall back to in-memory storage if database connection fails

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure you have the latest dependencies (`npm install`)
4. Check the [Issues](https://github.com/PaulKinlan/ContentCrafter/issues) page for known problems

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [OpenAI](https://openai.com) for content generation
- Images generated using [Replicate](https://replicate.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)