import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
// Every catalogue image is kept in the app. Do not replace this with an external
// stock-photo URL: the collection is intentionally original/local only.
const catalogueImage = (key: number) => `/images/catalogue/look-${String((Math.abs(key) % 9) + 1).padStart(2, '0')}.png`;
const img = (id: number) => catalogueImage(id);
const localImg = (id: number) => catalogueImage(id + 37);
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

async function main() {
  const adminPw = await bcrypt.hash('Admin@HauteNK2026', 12);
  const custPw = await bcrypt.hash('Customer@123', 12);

  await prisma.$executeRawUnsafe('TRUNCATE TABLE "WishlistItem", "Review", "OrderItem", "Order", "Coupon", "Variant", "Product", "Collection", "Category", "Address", "User", "NewsletterSubscriber", "AuditLog" RESTART IDENTITY CASCADE;');

  await prisma.user.upsert({
    where: { email: 'admin@hauteattirebynk.com' },
    update: {},
    create: { email: 'admin@hauteattirebynk.com', name: 'NK Admin', password: adminPw, role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'demo@customer.com' },
    update: {},
    create: { email: 'demo@customer.com', name: 'Demo Customer', password: custPw, role: 'CUSTOMER' },
  });

  const cats = [
    { name: 'Indian Wear', slug: 'indian-wear', children: [{ name: 'Kurta Sets', slug: 'kurta-sets' }, { name: 'Suits', slug: 'suits' }, { name: 'Co-ord Sets', slug: 'co-ord-sets' }, { name: 'Anarkali', slug: 'anarkali' }, { name: 'Lehengas', slug: 'lehengas' }, { name: 'Shararas', slug: 'shararas' }, { name: 'Dupattas', slug: 'dupattas' }] },
    { name: 'Western Wear', slug: 'western-wear', children: [{ name: 'Dresses', slug: 'dresses' }, { name: 'Co-ords', slug: 'co-ords' }, { name: 'Shirts', slug: 'shirts' }, { name: 'Tops', slug: 'tops' }, { name: 'Trousers', slug: 'trousers' }, { name: 'Jumpsuits', slug: 'jumpsuits' }] },
    { name: 'Accessories', slug: 'accessories', children: [] },
  ];

  for (const cat of cats) {
    const parent = await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: { name: cat.name, slug: cat.slug } });
    for (const child of cat.children) {
      await prisma.category.upsert({ where: { slug: child.slug }, update: {}, create: { name: child.name, slug: child.slug, parentId: parent.id } });
    }
  }

  const collections = [
    { name: 'Luxury Edit', slug: 'luxury', tagline: 'Investment pieces, refined.', image: '/images/catalogue/look-09.png' },
    { name: 'Wedding Season', slug: 'wedding', tagline: 'Dress the celebration.', image: '/images/catalogue/look-02.png' },
    { name: 'Festive', slug: 'festive', tagline: 'For every occasion that matters.', image: '/images/catalogue/look-01.png' },
    { name: 'Summer Edit', slug: 'summer', tagline: 'Light, breathable, beautiful.', image: '/images/catalogue/aarohi-chikankari-kurta-set.png' },
    { name: 'Winter Luxe', slug: 'winter', tagline: 'Warmth with intention.', image: '/images/catalogue/look-06.png' },
  ];

  for (const c of collections) {
    await prisma.collection.upsert({ where: { slug: c.slug }, update: { tagline: c.tagline, image: c.image }, create: c });
  }

  const products = [
    { name: 'Aarohi Chikankari Kurta Set', slug: 'aarohi-chikankari-kurta-set', sku: 'HA-IW-KS-101', cat: 'kurta-sets', price: 3499, mrp: 4299, fabric: 'Cotton muslin with hand chikankari', desc: 'A breezy ivory kurta set with delicate handwork and a softly draped dupatta made for festive brunches and city evenings.', images: [localImg(1), img(445)], colls: ['festive', 'summer'], featured: true, isNew: true, tags: ['chikankari', 'kurta set', 'indowestern'] },
    { name: 'Zivah Silk Anarkali', slug: 'zivah-silk-anarkali', sku: 'HA-IW-AN-102', cat: 'anarkali', price: 4999, mrp: 5999, fabric: 'Silk blend with zari detailing', desc: 'A champagne anarkali with a structured bodice and flowing flare for evening celebration dressing.', images: [img(975), img(972)], colls: ['wedding', 'luxury'], featured: true, tags: ['anarkali', 'champagne', 'fusion'] },
    { name: 'Meher Organza Lehenga', slug: 'meher-organza-lehenga', sku: 'HA-IW-LH-103', cat: 'lehengas', price: 12999, mrp: 15999, fabric: 'Organza with tonal sequins', desc: 'A soft pastel lehenga with fitted blouse and scalloped dupatta designed for wedding evenings.', images: [img(938), img(903)], colls: ['wedding', 'luxury'], featured: true, tags: ['lehenga', 'organza', 'bridal'] },
    { name: 'Sufi Sharara Set', slug: 'sufi-sharara-set', sku: 'HA-IW-SH-104', cat: 'shararas', price: 4299, mrp: 4999, fabric: 'Georgette with gota patti', desc: 'A flowing sharara with embroidered yoke detailing and a relaxed silhouette made for festive glamour.', images: [img(452), img(440)], colls: ['festive'], isNew: true, tags: ['sharara', 'festive', 'gota'] },
    { name: 'Banarasi Silk Dupatta', slug: 'banarasi-silk-dupatta', sku: 'HA-IW-DP-105', cat: 'dupattas', price: 1999, mrp: 2499, fabric: 'Pure Banarasi silk', desc: 'A luxe rani-pink dupatta with woven gold booti and graceful fall for elevated styling.', images: [img(433), img(432)], colls: ['festive', 'luxury'], tags: ['banarasi', 'dupatta', 'silk'] },
    { name: 'Ivory Palazzo Co-ord', slug: 'ivory-palazzo-coord', sku: 'HA-IW-CO-106', cat: 'co-ord-sets', price: 2999, mrp: 3499, fabric: 'Crepe with subtle sheen', desc: 'A polished ivory co-ord with longline kurta and wide palazzo trousers for work to dinner dressing.', images: [img(669), img(667)], colls: ['summer'], featured: true, isNew: true, tags: ['co-ord', 'ivory', 'workwear'] },
    { name: 'Naina Belted Suit Set', slug: 'naina-belted-suit-set', sku: 'HA-IW-SU-107', cat: 'suits', price: 3799, mrp: 4599, fabric: 'Cotton silk with lining', desc: 'A sharply tailored suit set with cinched waist and soft drape for polished everyday dressing.', images: [img(610), img(611)], colls: ['luxury', 'winter'], featured: true, tags: ['suit', 'belted', 'tailored'] },
    { name: 'Rhea Printed Kurta Dress', slug: 'rhea-printed-kurta-dress', sku: 'HA-IW-KS-108', cat: 'kurta-sets', price: 3299, mrp: 3899, fabric: 'Cotton blend with block print', desc: 'A relaxed kurta dress with hand-printed detailing designed for effortless day to night styling.', images: [localImg(2), img(631)], colls: ['summer'], isNew: true, tags: ['kurta dress', 'printed', 'summer'] },
    { name: 'Aditi Mirror Work Set', slug: 'aditi-mirror-work-set', sku: 'HA-IW-CO-109', cat: 'co-ord-sets', price: 3599, mrp: 4199, fabric: 'Georgette with mirror work', desc: 'A festive skirt set with mirror work accents and fitted top for sparkle at evening gatherings.', images: [img(770), img(771)], colls: ['festive', 'luxury'], isNew: true, tags: ['mirror work', 'skirt set', 'festive'] },
    { name: 'Saanvi Lehenga Choli', slug: 'saanvi-lehenga-choli', sku: 'HA-IW-LH-110', cat: 'lehengas', price: 11999, mrp: 13999, fabric: 'Net and silk with floral embroidery', desc: 'A modern lehenga choli with airy net and soft embroidery for celebration dressing.', images: [img(778), img(779)], colls: ['wedding'], featured: true, tags: ['lehenga', 'bridal', 'embroidered'] },
    { name: 'Mira Satin Slip Dress', slug: 'mira-satin-slip-dress', sku: 'HA-WW-DR-201', cat: 'dresses', price: 3999, mrp: 4599, fabric: 'Sandwashed satin', desc: 'A bias-cut slip dress with sculpted neckline and fluid drape for dinner and weekend plans.', images: [img(64), img(65)], colls: ['luxury'], featured: true, tags: ['slip dress', 'satin', 'evening'] },
    { name: 'Aria Linen Shirt', slug: 'aria-linen-shirt', sku: 'HA-WW-SH-202', cat: 'shirts', price: 2299, mrp: 2799, fabric: '100% European linen', desc: 'An oversized ecru shirt with relaxed sleeves and a crisp collar for summer ease.', images: [img(334), img(335)], colls: ['summer'], isNew: true, tags: ['linen', 'shirt', 'minimal'] },
    { name: 'Cleo Wide-Leg Trousers', slug: 'cleo-wide-leg-trousers', sku: 'HA-WW-TR-203', cat: 'trousers', price: 2499, mrp: 2999, fabric: 'Structured twill', desc: 'High-rise wide-leg trousers with sharp front crease and soft drape for contemporary styling.', images: [img(393), img(394)], colls: ['winter'], tags: ['trousers', 'wide-leg', 'beige'] },
    { name: 'Noir Satin Jumpsuit', slug: 'noir-satin-jumpsuit', sku: 'HA-WW-JS-204', cat: 'jumpsuits', price: 4499, mrp: 5299, fabric: 'Heavy satin', desc: 'A black satin jumpsuit with plunge neckline, self-belt and tapered leg for evening glamour.', images: [img(216), img(218)], colls: ['luxury', 'winter'], featured: true, tags: ['jumpsuit', 'black', 'evening'] },
    { name: 'Fleur Ruffle Top', slug: 'fleur-ruffle-top', sku: 'HA-WW-TP-205', cat: 'tops', price: 1499, mrp: 1899, fabric: 'Cotton voile', desc: 'A cropped top with fluted sleeves and soft gathers for romantic everyday dressing.', images: [img(326), img(327)], colls: ['summer'], isNew: true, tags: ['top', 'ruffle', 'summer'] },
    { name: 'Elara Tailored Co-ord', slug: 'elara-tailored-coord', sku: 'HA-WW-CO-206', cat: 'co-ords', price: 3299, mrp: 3899, fabric: 'Cotton blend with crisp finish', desc: 'A tailored co-ord with sculpted top and matching trousers for smart casual dressing.', images: [localImg(3), img(653)], colls: ['luxury', 'winter'], featured: true, tags: ['co-ord', 'tailored', 'statement'] },
    { name: 'Blue Summer Shirt', slug: 'blue-summer-shirt', sku: 'HA-WW-SH-207', cat: 'shirts', price: 1999, mrp: 2399, fabric: 'Cotton voile', desc: 'A lightweight blue shirt with airy feel and relaxed cut for bright days.', images: [localImg(4), img(654)], colls: ['summer'], tags: ['shirt', 'summer', 'blue'] },
    { name: 'Soft Kaftaan Tunic', slug: 'soft-kaftaan-tunic', sku: 'HA-WW-DR-208', cat: 'dresses', price: 2799, mrp: 3299, fabric: 'Silk blend', desc: 'A softly draped kaftaan tunic crafted for casual brunches and evening plans.', images: [localImg(5), img(655)], colls: ['summer'], tags: ['kaftaan', 'tunic', 'summer'] },
    { name: 'Embroidered Jacket Set', slug: 'embroidered-jacket-set', sku: 'HA-WW-SU-209', cat: 'suits', price: 4499, mrp: 5299, fabric: 'Hand-embroidered crepe', desc: 'A power-dressing set with fitted jacket and draped skirt for festive occasions.', images: [localImg(6), img(656)], colls: ['wedding', 'luxury'], featured: true, tags: ['jacket', 'drape', 'embroidered'] },
    { name: 'Ira Fusion Kurta Skirt', slug: 'ira-fusion-kurta-skirt', sku: 'HA-IW-KS-210', cat: 'kurta-sets', price: 3799, mrp: 4399, fabric: 'Cotton silk with printed border', desc: 'A fusion kurta skirt set with easy shirt-style top and flowing skirt for elevated dressing.', images: [img(444), img(446)], colls: ['summer', 'festive'], isNew: true, tags: ['fusion', 'kurta skirt', 'trendy'] },
    { name: 'Kavya Brocade Dupatta', slug: 'kavya-brocade-dupatta', sku: 'HA-IW-DP-211', cat: 'dupattas', price: 2599, mrp: 3099, fabric: 'Brocade with zari weave', desc: 'A statement dupatta with rich brocade texture and luxe drape for festive wardrobes.', images: [img(448), img(449)], colls: ['wedding', 'luxury'], featured: true, tags: ['brocade', 'dupatta', 'wedding'] },
    { name: 'Nivi Layered Anarkali', slug: 'nivi-layered-anarkali', sku: 'HA-IW-AN-212', cat: 'anarkali', price: 5599, mrp: 6499, fabric: 'Silk blend with layered hem', desc: 'A dramatic layered anarkali with soft movement for celebrations that call for impact.', images: [img(450), img(451)], colls: ['wedding', 'luxury'], tags: ['anarkali', 'layered', 'elegant'] },
    { name: 'Tara Asymmetrical Kurta', slug: 'tara-asymmetrical-kurta', sku: 'HA-IW-KS-213', cat: 'kurta-sets', price: 3199, mrp: 3799, fabric: 'Rayon and cotton', desc: 'An asymmetrical kurta with relaxed fit and high-low hem for modern Indo-Western styling.', images: [img(452), img(453)], colls: ['summer', 'festive'], isNew: true, tags: ['asymmetrical', 'kurta', 'fusion'] },
    { name: 'Pia Pleated Sharara', slug: 'pia-pleated-sharara', sku: 'HA-IW-SH-214', cat: 'shararas', price: 3899, mrp: 4699, fabric: 'Chiffon with pleated detailing', desc: 'A pleated sharara with lightweight fall and sculpted waistline for ornate yet modern dressing.', images: [img(454), img(455)], colls: ['festive', 'luxury'], featured: true, tags: ['sharara', 'pleated', 'festive'] },
    { name: 'Ragini Contemporary Suit', slug: 'ragini-contemporary-suit', sku: 'HA-IW-SU-215', cat: 'suits', price: 4199, mrp: 4999, fabric: 'Crepe and silk blend', desc: 'A contemporary suit with clean collar and flowing trousers for office or evening events.', images: [img(456), img(457)], colls: ['winter', 'luxury'], isNew: true, tags: ['suit', 'contemporary', 'workwear'] },
    { name: 'Sia Printed Shirt Dress', slug: 'sia-printed-shirt-dress', sku: 'HA-WW-DR-216', cat: 'dresses', price: 2899, mrp: 3499, fabric: 'Cotton poplin', desc: 'A shirt dress with printed panels and flattering waist tie for easy day dressing.', images: [img(458), img(459)], colls: ['summer'], featured: true, tags: ['shirt dress', 'printed', 'summer'] },
    { name: 'Maanvi Wrap Shirt', slug: 'maanvi-wrap-shirt', sku: 'HA-WW-SH-217', cat: 'shirts', price: 2199, mrp: 2699, fabric: 'Rayon voile', desc: 'A wrap-style shirt with softly cinched waist and relaxed sleeves for layering.', images: [img(460), img(461)], colls: ['summer'], isNew: true, tags: ['wrap shirt', 'summer', 'soft'] },
    { name: 'Ishita High-Low Dress', slug: 'ishita-high-low-dress', sku: 'HA-WW-DR-218', cat: 'dresses', price: 3599, mrp: 4299, fabric: 'Viscose with sheen', desc: 'A high-low dress with draped hem and sculpted neckline for modern events.', images: [img(462), img(463)], colls: ['luxury', 'winter'], featured: true, tags: ['high-low', 'dress', 'elevated'] },
    { name: 'Kriti Satin Blazer Top', slug: 'kriti-satin-blazer-top', sku: 'HA-WW-TP-219', cat: 'tops', price: 2399, mrp: 2899, fabric: 'Satin and crepe', desc: 'A blazer-inspired top with crisp lines and smooth finish for chic Indo-Western styling.', images: [img(464), img(465)], colls: ['winter', 'luxury'], tags: ['blazer', 'top', 'statement'] },
    { name: 'Naina Wide-Leg Co-ord', slug: 'naina-wide-leg-coord', sku: 'HA-WW-CO-220', cat: 'co-ords', price: 3099, mrp: 3699, fabric: 'Viscose twill', desc: 'A matching set with relaxed blouse and flowing wide-leg pants for elevated comfort.', images: [img(466), img(467)], colls: ['summer', 'luxury'], featured: true, tags: ['co-ord', 'wide-leg', 'relaxed'] },
    { name: 'Veda Linen Jumpsuit', slug: 'veda-linen-jumpsuit', sku: 'HA-WW-JS-221', cat: 'jumpsuits', price: 3399, mrp: 3999, fabric: 'Linen blend', desc: 'A breathable linen jumpsuit with easy structure and contemporary cut for warm-weather dressing.', images: [img(468), img(469)], colls: ['summer'], isNew: true, tags: ['jumpsuit', 'linen', 'summer'] },
    { name: 'Riya Pleated Trousers', slug: 'riya-pleated-trousers', sku: 'HA-WW-TR-222', cat: 'trousers', price: 2699, mrp: 3199, fabric: 'Twill with pleat detail', desc: 'Pleated trousers with sharp silhouette and fluid movement for polished workwear.', images: [img(470), img(471)], colls: ['winter', 'luxury'], featured: true, tags: ['trousers', 'pleated', 'workwear'] },
    { name: 'Asha Cowl Neck Dress', slug: 'asha-cowl-neck-dress', sku: 'HA-WW-DR-223', cat: 'dresses', price: 3299, mrp: 3899, fabric: 'Viscose crepe', desc: 'A draped cowl-neck dress with graceful silhouette and luxe feel for special occasions.', images: [img(472), img(473)], colls: ['luxury'], tags: ['dress', 'cowl neck', 'elegant'] },
    { name: 'Shivani Tailored Shirt', slug: 'shivani-tailored-shirt', sku: 'HA-WW-SH-224', cat: 'shirts', price: 2499, mrp: 2999, fabric: 'Cotton poplin', desc: 'A tailored shirt with elevated collar work and relaxed cut for smart-casual dressing.', images: [img(474), img(475)], colls: ['summer'], isNew: true, tags: ['shirt set', 'tailored', 'smart'] },
    { name: 'Maya Satin Top Set', slug: 'maya-satin-top-set', sku: 'HA-WW-TP-225', cat: 'tops', price: 2199, mrp: 2699, fabric: 'Satin', desc: 'A matching top set with polished finish and soft sheen for evenings and festive events.', images: [img(476), img(477)], colls: ['festive', 'luxury'], featured: true, tags: ['top set', 'satin', 'festive'] },
    { name: 'Kavya Structured Jumpsuit', slug: 'kavya-structured-jumpsuit', sku: 'HA-WW-JS-226', cat: 'jumpsuits', price: 3799, mrp: 4499, fabric: 'Crepe with lining', desc: 'A structured jumpsuit with sleek shoulders and streamlined fit for modern dressing.', images: [img(478), img(479)], colls: ['winter', 'luxury'], isNew: true, tags: ['jumpsuit', 'structured', 'modern'] },
    { name: 'Nivah Drape Shirt', slug: 'nivah-drape-shirt', sku: 'HA-WW-SH-227', cat: 'shirts', price: 2399, mrp: 2899, fabric: 'Rayon', desc: 'A draped shirt with softened shoulders and relaxed fall that works over skirts or trousers.', images: [img(480), img(481)], colls: ['summer'], featured: true, tags: ['drape', 'shirt', 'easy'] },
    { name: 'Zara Printed Co-ord', slug: 'zara-printed-coord', sku: 'HA-WW-CO-228', cat: 'co-ords', price: 2899, mrp: 3399, fabric: 'Cotton blend', desc: 'A printed co-ord with modern silhouette and comfortable fit inspired by street-style sophistication.', images: [img(482), img(483)], colls: ['summer'], isNew: true, tags: ['printed', 'co-ord', 'daily'] },
    { name: 'Anaya Draped Trousers', slug: 'anaya-draped-trousers', sku: 'HA-WW-TR-229', cat: 'trousers', price: 2599, mrp: 3099, fabric: 'Viscose with fluid drape', desc: 'Draped trousers with elegant movement and flattering rise for elevated styling.', images: [img(484), img(485)], colls: ['winter', 'luxury'], tags: ['trousers', 'draped', 'elevated'] },
    { name: 'Simran Layered Dress', slug: 'simran-layered-dress', sku: 'HA-WW-DR-230', cat: 'dresses', price: 3499, mrp: 4199, fabric: 'Silk blend', desc: 'A layered dress with soft texture and graceful movement for refined occasions and festive evenings.', images: [img(486), img(487)], colls: ['festive', 'luxury'], featured: true, tags: ['layered', 'dress', 'festive'] },
    { name: 'Avni Embroidered Kaftan', slug: 'avni-embroidered-kaftan', sku: 'HA-IW-KF-231', cat: 'kurta-sets', price: 3899, mrp: 4699, fabric: 'Viscose silk with thread embroidery', desc: 'A fluid kaftan-inspired kurta set with artisan embroidery and an easy, celebratory drape.', images: [img(501), img(502)], colls: ['festive', 'luxury'], isNew: true, tags: ['kaftan', 'embroidered', 'fusion'] },
    { name: 'Eira Cape Co-ord', slug: 'eira-cape-coord', sku: 'HA-IW-CO-232', cat: 'co-ord-sets', price: 4299, mrp: 5099, fabric: 'Crepe with satin lining', desc: 'A sculpted co-ord finished with a detachable cape layer for a confident modern silhouette.', images: [img(503), img(504)], colls: ['luxury', 'winter'], featured: true, tags: ['cape', 'co-ord', 'occasion'] },
    { name: 'Ruhani Zari Anarkali', slug: 'ruhani-zari-anarkali', sku: 'HA-IW-AN-233', cat: 'anarkali', price: 6499, mrp: 7599, fabric: 'Silk blend with zari border', desc: 'A deep jewel-tone anarkali with a clean bodice and luminous zari accents for evening ceremonies.', images: [img(505), img(506)], colls: ['wedding', 'luxury'], tags: ['anarkali', 'zari', 'jewel tone'] },
    { name: 'Alina Drape Saree Set', slug: 'alina-drape-saree-set', sku: 'HA-IW-SS-234', cat: 'suits', price: 5999, mrp: 6999, fabric: 'Pre-draped satin georgette', desc: 'A modern pre-draped saree silhouette with a tailored blouse for effortless festive dressing.', images: [img(507), img(508)], colls: ['festive', 'wedding'], isNew: true, tags: ['drape saree', 'satin', 'fusion'] },
    { name: 'Vanya Floral Lehenga', slug: 'vanya-floral-lehenga', sku: 'HA-IW-LH-235', cat: 'lehengas', price: 13999, mrp: 16499, fabric: 'Organza with tonal embroidery', desc: 'A romantic floral lehenga with a lightly structured blouse and airy dupatta.', images: [img(509), img(510)], colls: ['wedding', 'luxury'], featured: true, tags: ['lehenga', 'floral', 'wedding'] },
    { name: 'Tara Tapered Kurta Set', slug: 'tara-tapered-kurta-set', sku: 'HA-IW-KS-236', cat: 'kurta-sets', price: 3199, mrp: 3799, fabric: 'Cotton satin', desc: 'A neat tapered kurta set with a contrast neckline and a polished everyday finish.', images: [img(511), img(512)], colls: ['summer'], isNew: true, tags: ['kurta set', 'everyday', 'tailored'] },
    { name: 'Mysa Gota Sharara', slug: 'mysa-gota-sharara', sku: 'HA-IW-SH-237', cat: 'shararas', price: 4899, mrp: 5699, fabric: 'Georgette with gota accents', desc: 'A softly flared sharara set with light-catching gota details made for joyful evenings.', images: [img(513), img(514)], colls: ['festive', 'wedding'], tags: ['sharara', 'gota', 'celebration'] },
    { name: 'Nyla Brocade Jacket', slug: 'nyla-brocade-jacket', sku: 'HA-IW-SU-238', cat: 'suits', price: 5399, mrp: 6299, fabric: 'Brocade and crepe', desc: 'A cropped brocade jacket layered over fluid trousers for sharp Indo-Western styling.', images: [img(515), img(516)], colls: ['luxury', 'winter'], featured: true, tags: ['jacket', 'brocade', 'indo western'] },
    { name: 'Sera Pleat Dress', slug: 'sera-pleat-dress', sku: 'HA-WW-DR-239', cat: 'dresses', price: 3799, mrp: 4499, fabric: 'Pleated viscose', desc: 'A pleated midi dress with a structured shoulder and a graceful swing through the skirt.', images: [img(517), img(518)], colls: ['luxury'], isNew: true, tags: ['pleated', 'midi dress', 'occasion'] },
    { name: 'Kaira Linen Co-ord', slug: 'kaira-linen-coord', sku: 'HA-WW-CO-240', cat: 'co-ords', price: 3499, mrp: 4099, fabric: 'Washed linen blend', desc: 'A breathable relaxed co-ord with a boxy shirt and wide trousers for long summer days.', images: [img(519), img(520)], colls: ['summer'], tags: ['linen', 'co-ord', 'easy dressing'] },
    { name: 'Inaya Satin Column Dress', slug: 'inaya-satin-column-dress', sku: 'HA-WW-DR-241', cat: 'dresses', price: 4499, mrp: 5199, fabric: 'Sandwashed satin', desc: 'A clean column dress with a draped neckline and a luminous finish for dinner dressing.', images: [img(521), img(522)], colls: ['luxury', 'winter'], featured: true, tags: ['satin', 'column dress', 'evening'] },
    { name: 'Aarna Utility Shirt', slug: 'aarna-utility-shirt', sku: 'HA-WW-SH-242', cat: 'shirts', price: 2499, mrp: 2999, fabric: 'Cotton poplin', desc: 'A refined utility shirt with oversized pockets and an adjustable waist tie.', images: [img(523), img(524)], colls: ['summer'], isNew: true, tags: ['shirt', 'utility', 'cotton'] },
    { name: 'Meera Sculpted Top', slug: 'meera-sculpted-top', sku: 'HA-WW-TP-243', cat: 'tops', price: 2299, mrp: 2799, fabric: 'Structured crepe', desc: 'A sculpted top with a soft asymmetric fold that pairs effortlessly with tailoring.', images: [img(525), img(526)], colls: ['luxury'], tags: ['top', 'sculpted', 'modern'] },
    { name: 'Aira Panelled Trousers', slug: 'aira-panelled-trousers', sku: 'HA-WW-TR-244', cat: 'trousers', price: 2799, mrp: 3299, fabric: 'Fluid twill', desc: 'Panelled wide-leg trousers designed to hold a clean line while moving beautifully.', images: [img(527), img(528)], colls: ['winter', 'luxury'], tags: ['trousers', 'wide leg', 'tailoring'] },
    { name: 'Diya Wrap Jumpsuit', slug: 'diya-wrap-jumpsuit', sku: 'HA-WW-JS-245', cat: 'jumpsuits', price: 4299, mrp: 4999, fabric: 'Matte satin', desc: 'A wrap-front jumpsuit with a soft belt and relaxed wide leg for effortless event dressing.', images: [img(529), img(530)], colls: ['luxury', 'festive'], featured: true, tags: ['jumpsuit', 'wrap', 'evening'] },
    { name: 'Zoya Embellished Shirt', slug: 'zoya-embellished-shirt', sku: 'HA-WW-SH-246', cat: 'shirts', price: 2899, mrp: 3399, fabric: 'Silk blend with beadwork', desc: 'A softly embellished shirt that brings a touch of occasion to relaxed separates.', images: [img(531), img(532)], colls: ['festive', 'luxury'], isNew: true, tags: ['shirt', 'embellished', 'festive'] },
    { name: 'Kiara Drape Skirt Set', slug: 'kiara-drape-skirt-set', sku: 'HA-WW-CO-247', cat: 'co-ords', price: 3999, mrp: 4699, fabric: 'Viscose satin', desc: 'A contemporary drape skirt paired with a minimal top for a sleek fusion look.', images: [img(533), img(534)], colls: ['festive', 'luxury'], tags: ['skirt set', 'drape', 'fusion'] },
    { name: 'Noor Velvet Blazer', slug: 'noor-velvet-blazer', sku: 'HA-WW-TP-248', cat: 'tops', price: 4699, mrp: 5499, fabric: 'Stretch velvet', desc: 'A sharp velvet blazer with a softened shoulder and a longline silhouette.', images: [img(535), img(536)], colls: ['winter', 'luxury'], featured: true, tags: ['blazer', 'velvet', 'tailored'] },
    { name: 'Sana Corset Dress', slug: 'sana-corset-dress', sku: 'HA-WW-DR-249', cat: 'dresses', price: 4999, mrp: 5899, fabric: 'Satin-backed crepe', desc: 'A corset-inspired dress with a softly flared skirt and considered seam detail.', images: [img(537), img(538)], colls: ['luxury', 'winter'], isNew: true, tags: ['corset dress', 'occasion', 'modern'] },
    { name: 'Rhea Printed Palazzo Set', slug: 'rhea-printed-palazzo-set', sku: 'HA-IW-CO-250', cat: 'co-ord-sets', price: 3699, mrp: 4399, fabric: 'Printed cotton silk', desc: 'A printed palazzo set with a clean neckline and an airy silhouette for celebrations at ease.', images: [img(539), img(540)], colls: ['summer', 'festive'], featured: true, tags: ['palazzo', 'printed', 'indo western'] },
  ];

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.cat } });
    if (!category) continue;

    const collectionIds: { id: string }[] = [];
    for (const cs of p.colls || []) {
      const c = await prisma.collection.findUnique({ where: { slug: cs } });
      if (c) collectionIds.push({ id: c.id });
    }

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { images: p.images },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        priceInr: p.price * 100,
        mrpInr: (p.mrp || p.price) * 100,
        description: p.desc,
        fabric: p.fabric,
        images: p.images,
        tags: p.tags,
        isFeatured: p.featured || false,
        isNew: p.isNew || false,
        isActive: true,
        categoryId: category.id,
        collections: { connect: collectionIds },
      },
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
