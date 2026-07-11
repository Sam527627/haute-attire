#!/bin/sh
set -e
echo "▶ Running Prisma db push..."
npx prisma db push --skip-generate
echo "▶ Running seed..."
npx tsx prisma/seed.ts || echo "Seed already done or skipped"
echo "▶ Starting Next.js..."
exec npm start
