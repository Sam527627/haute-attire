import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const img = (id: number) => `https://picsum.photos/id/${id}/1200/1500`;
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
async function main() {
  const adminPw = await bcrypt.hash('Admin@HauteNK2026', 12);
  const custPw = await bcrypt.hash('Customer@123', 12);
  await prisma.user.upsert({ where: { email: 'admin@hauteattirebynk.com' }, update: {}, create: { email: 'admin@hauteattirebynk.com', name: 'NK Admin', password: adminPw, role: 'ADMIN' } });
  await prisma.user.upsert({ where: { email: 'demo@customer.com' }, update: {}, create: { email: 'demo@customer.com', name: 'Demo Customer', password: custPw, role: 'CUSTOMER' } });
  const cats = [
    { name: 'Indian Wear', slug: 'indian-wear', children: [{ name: 'Kurta Sets', slug: 'kurta-sets' },{ name: 'Suits', slug: 'suits' },{ name: 'Co-ord Sets', slug: 'co-ord-sets' },{ name: 'Anarkali', slug: 'anarkali' },{ name: 'Lehengas', slug: 'lehengas' },{ name: 'Shararas', slug: 'shararas' },{ name: 'Dupattas', slug: 'dupattas' }]},
    { name: 'Western Wear', slug: 'western-wear', children: [{ name: 'Dresses', slug: 'dresses' },{ name: 'Co-ords', slug: 'co-ords' },{ name: 'Shirts', slug: 'shirts' },{ name: 'Tops', slug: 'tops' },{ name: 'Trousers', slug: 'trousers' },{ name: 'Jumpsuits', slug: 'jumpsuits' }]},
    { name: 'Accessories', slug: 'accessories', children: [] },
  ];
  for (const cat of cats) {
    const parent = await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: { name: cat.name, slug: cat.slug } });
    for (const child of cat.children) {
      await prisma.category.upsert({ where: { slug: child.slug }, update: {}, create: { name: child.name, slug: child.slug, parentId: parent.id } });
    }
  }
  const collections = [
    { name: 'Luxury Edit', slug: 'luxury', tagline: 'Investment pieces, refined.' },
    { name: 'Wedding Season', slug: 'wedding', tagline: 'Dress the celebration.' },
    { name: 'Festive', slug: 'festive', tagline: 'For every occasion that matters.' },
    { name: 'Summer Edit', slug: 'summer', tagline: 'Light, breathable, beautiful.' },
    { name: 'Winter Luxe', slug: 'winter', tagline: 'Warmth with intention.' },
  ];
  for (const c of collections) { await prisma.collection.upsert({ where: { slug: c.slug }, update: {}, create: c }); }
  const products = [
    { name: 'Noor Chikankari Kurta Set', slug: 'noor-chikankari-kurta-set', sku: 'HA-IW-KS-001', cat: 'kurta-sets', price: 3499, mrp: 4299, fabric: 'Fine cotton with hand chikankari', desc: 'An ivory three-piece kurta set with hand-embroidered chikankari, straight pants, and a soft mulmul dupatta.', images: [img(445), img(426)], colls: ['festive','summer'], featured: true, isNew: true, tags: ['chikankari','ivory','kurta set'] },
    { name: 'Zoya Anarkali in Champagne', slug: 'zoya-anarkali-champagne', sku: 'HA-IW-AN-002', cat: 'anarkali', price: 4999, mrp: 5999, fabric: 'Silk-blend with zari border', desc: 'A floor-grazing anarkali in champagne gold with a delicate zari hemline and matching churidar.', images: [img(975), img(972)], colls: ['wedding','luxury'], featured: true, tags: ['anarkali','champagne','wedding'] },
    { name: 'Mehr Organza Lehenga', slug: 'mehr-organza-lehenga', sku: 'HA-IW-LH-003', cat: 'lehengas', price: 12999, mrp: 15999, fabric: 'Organza with sequin work', desc: 'A soft-pastel organza lehenga with tonal sequins, fitted blouse, and scalloped dupatta.', images: [img(938), img(903)], colls: ['wedding','luxury'], featured: true, tags: ['lehenga','organza','bridal'] },
    { name: 'Sufi Sharara Set', slug: 'sufi-sharara-set', sku: 'HA-IW-SH-004', cat: 'shararas', price: 4299, fabric: 'Georgette with gota patti', desc: 'A flowing georgette sharara with gota patti detailing at the yoke.', images: [img(452)], colls: ['festive'], isNew: true, tags: ['sharara','gota patti'] },
    { name: 'Banarasi Silk Dupatta', slug: 'banarasi-dupatta-rani-pink', sku: 'HA-IW-DP-005', cat: 'dupattas', price: 1999, fabric: 'Pure Banarasi silk', desc: 'A pure Banarasi silk dupatta in rani pink with woven gold booti.', images: [img(433)], colls: ['festive','luxury'], tags: ['banarasi','dupatta','silk'] },
    { name: 'Ivory Palazzo Co-ord', slug: 'ivory-palazzo-coord', sku: 'HA-IW-CO-006', cat: 'co-ord-sets', price: 2999, mrp: 3499, fabric: 'Crepe', desc: 'A crisp ivory co-ord: a longline shirt-kurta with palazzo trousers.', images: [img(669)], colls: ['summer'], featured: true, isNew: true, tags: ['co-ord','ivory','workwear'] },
    { name: 'Meera Slip Dress in Silk', slug: 'meera-silk-slip-dress', sku: 'HA-WW-DR-007', cat: 'dresses', price: 3999, mrp: 4599, fabric: 'Sandwashed silk', desc: 'A bias-cut slip dress in sandwashed silk with adjustable straps and a soft cowl neckline.', images: [img(64), img(65)], colls: ['luxury'], featured: true, tags: ['slip dress','silk','evening'] },
    { name: 'Aria Linen Shirt — Ecru', slug: 'aria-linen-shirt-ecru', sku: 'HA-WW-SH-008', cat: 'shirts', price: 2299, fabric: '100% European linen', desc: 'An oversized ecru linen shirt with mother-of-pearl buttons.', images: [img(334)], colls: ['summer'], isNew: true, tags: ['linen','shirt','minimal'] },
    { name: 'Cléo Wide-Leg Trousers', slug: 'cleo-wide-leg-trousers', sku: 'HA-WW-TR-009', cat: 'trousers', price: 2499, fabric: 'Structured twill', desc: 'High-rise wide-leg trousers in warm beige twill with pressed front crease.', images: [img(393)], colls: ['winter'], tags: ['trousers','wide-leg','beige'] },
    { name: 'Noir Satin Jumpsuit', slug: 'noir-satin-jumpsuit', sku: 'HA-WW-JS-010', cat: 'jumpsuits', price: 4499, mrp: 5299, fabric: 'Heavy satin', desc: 'A black satin jumpsuit with a plunge neckline, self-belt, and tapered leg.', images: [img(216)], colls: ['luxury','winter'], featured: true, tags: ['jumpsuit','black','evening'] },
    { name: 'Fleur Ruffle Top', slug: 'fleur-ruffle-top', sku: 'HA-WW-TP-011', cat: 'tops', price: 1499, fabric: 'Cotton voile', desc: 'A cropped voile top with fluted ruffle sleeves.', images: [img(326)], colls: ['summer'], isNew: true, tags: ['top','ruffle'] },
    { name: 'Gilded Thread Potli Bag', slug: 'gilded-thread-potli', sku: 'HA-AC-PB-012', cat: 'accessories', price: 1499, fabric: 'Brocade with zari drawstring', desc: 'A hand-finished brocade potli with champagne zari drawstring and silk lining.', images: [img(219)], colls: ['wedding','festive'], tags: ['potli','accessory'] },
    { name: 'Champagne Kaftan Set', slug: 'champagne-kaftan-set', sku: 'HA-WW-KA-013', cat: 'co-ord-sets', price: 2599, fabric: 'Silk blend with gold shimmer', desc: 'A relaxed kaftan set in champagne with subtle embroidery and wide-leg palazzo pants.', images: ['/images/products/insta1.jpg'], colls: ['summer','festive'], isNew: true, tags: ['kaftaan','co-ord','ombre','instagram'] },
    { name: 'Satin Summer Shirt', slug: 'satin-summer-shirt', sku: 'HA-WW-SH-014', cat: 'shirts', price: 2199, fabric: 'Satin', desc: 'A breezy satin shirt in a cool pastel shade, cut for relaxed summer styling.', images: ['/images/products/insta2.jpg'], colls: ['summer'], isNew: true, tags: ['shirt','summer','satin','instagram'] },
    { name: 'Famous Cord Set', slug: 'famous-cord-set', sku: 'HA-WW-CO-015', cat: 'co-ords', price: 3299, fabric: 'Cotton blend', desc: 'A coordinated cord set with tonal top and trousers for statement styling.', images: ['/images/products/insta3.jpg'], colls: ['luxury','winter'], featured: true, tags: ['cordset','co-ord','statement','instagram'] },
    { name: 'Blue Summer Shirt', slug: 'blue-summer-shirt', sku: 'HA-WW-SH-016', cat: 'shirts', price: 1999, fabric: 'Cotton voile', desc: 'A lightweight blue shirt designed for summer comfort and easy layering.', images: ['/images/products/insta4.jpg'], colls: ['summer'], tags: ['shirt','summer','blue','instagram'] },
    { name: 'Soft Kaftaan Tunic', slug: 'soft-kaftaan-tunic', sku: 'HA-WW-DR-017', cat: 'dresses', price: 2799, fabric: 'Silk blend', desc: 'A soft kaftaan tunic with gentle drape, ideal for day-to-night dressing.', images: ['/images/products/insta5.jpg'], colls: ['summer'], tags: ['kaftaan','tunic','summer','instagram'] },
    { name: 'Embroidered Jacket Drape Skirt', slug: 'embroidered-jacket-drape-skirt', sku: 'HA-WW-SU-018', cat: 'suits', price: 4499, fabric: 'Hand-embroidered crepe', desc: 'A power-dressing ensemble with a fitted jacket and drape skirt for festive occasions.', images: ['/images/products/insta6.jpg'], colls: ['wedding','luxury'], featured: true, tags: ['jacket','drapeskirt','handembroidered','instagram'] },
  ];
  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.cat } });
    if (!category) continue;
    const collectionIds: { id: string }[] = [];
    for (const cs of p.colls || []) { const c = await prisma.collection.findUnique({ where: { slug: cs } }); if (c) collectionIds.push({ id: c.id }); }
    const product = await prisma.product.upsert({
      where: { slug: p.slug }, update: { images: p.images },
      create: { name: p.name, slug: p.slug, sku: p.sku, priceInr: p.price*100, mrpInr: (p.mrp||p.price)*100, description: p.desc, fabric: p.fabric, images: p.images, tags: p.tags, isFeatured: p.featured||false, isNew: p.isNew||false, isActive: true, categoryId: category.id, collections: { connect: collectionIds } },
    });
    for (const size of SIZES) {
      const sku = `${p.sku}-${size}`;
      await prisma.variant.upsert({
        where: { productId_size_color: { productId: product.id, size, color: 'Default' } },
        update: {},
        create: {
          productId: product.id,
          size,
          color: 'Default',
          sku,
          stock: [4, 12, 15, 10, 3][SIZES.indexOf(size)],
        },
      });
    }
  }
  await prisma.coupon.upsert({ where: { code: 'WELCOME10' }, update: {}, create: { code: 'WELCOME10', percentOff: 10, minOrderInr: 199900, maxUses: 500 } });
  await prisma.coupon.upsert({ where: { code: 'FESTIVE500' }, update: {}, create: { code: 'FESTIVE500', amountOffInr: 50000, minOrderInr: 349900, maxUses: 200 } });
  console.log('Seed complete');
}
main().catch(console.error).finally(() => prisma.$disconnect());
