# Apple ID Guard

A modern Apple ID auto-management tool built with Node.js, NestJS, and Playwright.

## Features

- 🔐 Automatic Apple ID unlock
- 🔑 Password management and auto-update
- 📱 Device management (remove devices)
- 🔔 Multi-channel notifications (Telegram, WeChat, Webhook)
- 🌍 Multi-language support (Chinese, English)
- 🎭 Playwright-based browser automation
- 🐳 Docker support

## Prerequisites

- Node.js 20+
- npm or yarn
- Docker (optional)

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd appleid-guard
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Configure your environment variables in `.env`

6. Run the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Docker Deployment

1. Build the image:
```bash
docker build -t appleid-guard .
```

2. Run with docker-compose:
```bash
docker-compose up -d
```

Or run directly:
```bash
docker run -d \
  -e API_URL=your_api_url \
  -e API_KEY=your_api_key \
  -e TASK_ID=your_task_id \
  -e LANG=zh_cn \
  appleid-guard
```

## Configuration

### Environment Variables

- `API_URL`: Your API server URL
- `API_KEY`: API authentication key
- `TASK_ID`: Task ID to execute
- `LANG`: Language (zh_cn, en_us, vi_vn)
- `DEBUG`: Debug mode (true/false)

### Command Line Arguments

You can also use command line arguments:

```bash
npm start -- -api_url=http://your-api.com -api_key=your-key -taskid=123 -lang=zh_cn -debug
```

## Architecture

This project follows the KISS (Keep It Simple, Stupid) principle with a clean modular structure:

```
src/
├── common/          # Shared utilities and types
│   ├── constants/   # Application constants
│   ├── types/       # TypeScript interfaces
│   └── utils/       # Utility functions
├── locales/         # Internationalization
├── modules/         # Feature modules
│   ├── api/         # API communication service
│   ├── appleid/     # Apple ID management logic
│   ├── browser/     # Playwright browser automation
│   ├── notification/# Notification services
│   └── task/        # Task scheduler
├── app.module.ts    # Root module
└── main.ts          # Application entry point
```

## Features Comparison

| Feature | Python (Old) | NestJS (New) |
|---------|--------------|--------------|
| Framework | None | NestJS |
| Browser | Selenium | Playwright |
| OCR | ddddocr | Manual (extensible) |
| Type Safety | ❌ | ✅ TypeScript |
| Architecture | Procedural | Modular/DI |
| Testing | ❌ | ✅ Jest ready |
| Docker | ✅ | ✅ Optimized |

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Test

```bash
npm run test
```

## License

MIT

## Version

v3.0-20241124

## Migration from Python Version

This is a complete rewrite of the original Python-based tool with the following improvements:

1. **Modern Stack**: NestJS + TypeScript for better maintainability
2. **Better Performance**: Playwright is faster and more reliable than Selenium
3. **Type Safety**: Full TypeScript support prevents runtime errors
4. **Modular Design**: Clean separation of concerns
5. **Testing Ready**: Built-in Jest support for unit and e2e tests
6. **Production Ready**: Optimized Docker image with multi-stage builds

## Troubleshooting

### Captcha Handling

Currently, captcha requires manual intervention. In production, you can integrate with OCR services by extending the `AppleIdService`.

### Browser Issues

If you encounter browser-related issues:
- Ensure Chromium is installed: `npx playwright install chromium`
- For Docker: The image includes necessary dependencies
- Check proxy configuration if using one

### Debug Mode

Enable debug mode to see the browser in action:
```bash
npm start -- -api_url=<url> -api_key=<key> -taskid=<id> -debug
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
