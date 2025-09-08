# TrendDojo V2

Professional trading platform with systematic risk management and position sizing tools.

## 🚀 Quick Start

This app supports **graceful degradation** - it works with or without a database:

### Marketing Site Only (No Database Required)
```bash
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) - marketing pages work fully!

### Full App (With Database)
1. Set up database (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))
2. Add `DATABASE_URL` to `.env.local`
3. Run migrations: `npx prisma migrate dev`
4. Start: `npm run dev`

## 📦 Deployment

### Vercel (Recommended)
- **Preview deployments**: Work automatically without database
- **Production**: Requires database setup (see DATABASE_SETUP.md)
- Connect GitHub → Auto-deploy on push

### Environment Variables
```env
DATABASE_URL="postgresql://..." # Required for full functionality
NEXTAUTH_URL="your-domain.com"  # Required for auth
NEXTAUTH_SECRET="your-secret"   # Required for auth
```

## 🎯 Features

- **Professional Marketing Site**: Polygon.io-inspired design
- **Graceful Degradation**: Runs without database for previews
- **Risk Management**: Position sizing and portfolio controls
- **Trading Journal**: Track and analyze performance
- **Broker Integration**: Alpaca, IBKR, TD Ameritrade support

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Deployment secrets configured - testing pipeline
