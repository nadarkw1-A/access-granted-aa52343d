import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Flame,
  Star,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Send,
  Check,
  Menu,
  ChevronDown,
  Sparkles,
} from 'lucide-react';



// ============================================================================
// TYPES
// ============================================================================

type SizeVariant = '8 oz' | '16 oz' | '32 oz';
type ProteinVariant = 'Plain (No Meat)' | 'Halal Beef' | 'Chicken';
type SpiceLevel = 'pepper-free' | 'mild' | 'spicy' | 'very-hot' | 'halal-chicken' | 'halal-beef';

interface ShitoProduct {
  id: string;
  name: string;
  spiceLevel: SpiceLevel;
  spiceLevelDisplay: string;
  spiceRating: number;
  description: string;
  image: string;
  badge: string;
  pairsWith: string;
}

interface SelectedVariants {
  size: SizeVariant;
  protein: ProteinVariant;
}

interface CartItem {
  id: string;
  product: ShitoProduct;
  variants: SelectedVariants;
  price: number;
  quantity: number;
}

// ============================================================================
// PRICING
// ============================================================================

const SIZE_BASE_PRICES: Record<SizeVariant, number> = {
  '8 oz': 11.99,
  '16 oz': 18.99,
  '32 oz': 31.99,
};

const PROTEIN_ADDONS: Record<SizeVariant, number> = {
  '8 oz': 1.50,
  '16 oz': 2.50,
  '32 oz': 3.50,
};

function calculatePrice(size: SizeVariant, protein: ProteinVariant): number {
  const base = SIZE_BASE_PRICES[size];
  const addon = protein !== 'Plain (No Meat)' ? PROTEIN_ADDONS[size] : 0;
  return base + addon;
}

function generateCartItemId(productId: string, variants: SelectedVariants): string {
  return `${productId}--${variants.size.replace(' ', '')}--${variants.protein.replace(/\s/g, '-')}`;
}

// ============================================================================
// PRODUCT DATA — 6 Shito Sauce varieties
// ============================================================================

const sizeOptions: SizeVariant[] = ['8 oz', '16 oz', '32 oz'];
const proteinOptions: ProteinVariant[] = ['Plain (No Meat)', 'Halal Beef', 'Chicken'];

const shitoProducts: ShitoProduct[] = [
  {
    id: 'shito-pepper-free',
    name: 'Nkor Shito Sauce - Pepper Free',
    spiceLevel: 'pepper-free',
    spiceLevelDisplay: 'Pepper Free',
    spiceRating: 0,
    description: 'All the rich, savory umami of traditional Ghanaian Shito without any heat. Slow-simmered with smoked crayfish and native aromatics — deep flavor, zero fire. Great for the whole family.',
    image: '/pepper_free.png',
    badge: 'Family Friendly',
    pairsWith: 'Waakye, Boiled Yam, Kelewele',
  },
  {
    id: 'shito-mild',
    name: 'Nkor Shito Sauce - Mild',
    spiceLevel: 'mild',
    spiceLevelDisplay: 'Mild',
    spiceRating: 2,
    description: 'A gentle, aromatic entry into Ghanaian Shito. Subtle Scotch bonnet warmth layered with dried herrings, crayfish, and native spices. The everyday crowd-pleaser.',
    image: '/nkor_mild.png',
    badge: 'Authentic',
    pairsWith: 'Banku, Fried Tilapia, Kenkey',
  },
  {
    id: 'shito-spicy',
    name: 'Nkor Shito Sauce - Spicy',
    spiceLevel: 'spicy',
    spiceLevelDisplay: 'Spicy',
    spiceRating: 4,
    description: 'The real Shito experience. Bold Scotch bonnet fire, rich umami from smoked herring and crayfish, slow-simmered to legendary depth. This is Ghana in a jar.',
    image: '/nkor_spicy.png',
    badge: 'Best Seller',
    pairsWith: 'Fufu, Light Soup, Jollof Rice',
  },
  {
    id: 'shito-very-hot',
    name: 'Nkor Shito Sauce - Very Hot',
    spiceLevel: 'very-hot',
    spiceLevelDisplay: 'Very Hot',
    spiceRating: 5,
    description: 'For the true pepper warriors. Double Scotch bonnet with ghost pepper heat, anchored by the signature Nkor umami base. Wɔ ho hia aduro! A Ghanaian rite of passage.',
    image: '/nkor_veryhot.png',
    badge: 'Ferocious',
    pairsWith: 'Grilled Tilapia, Banku, Fried Plantain',
  },
  {
    id: 'shito-halal-chicken',
    name: 'Nkor Shito Sauce - Halal Chicken',
    spiceLevel: 'halal-chicken',
    spiceLevelDisplay: 'Halal Chicken',
    spiceRating: 3,
    description: 'Tender halal chicken slow-simmered in our signature Shito base with Scotch bonnet warmth and native aromatics. A comforting, protein-rich take on Ghanaian tradition.',
    image: '/nkor_eats_halal_chicken.png',
    badge: 'Halal Certified',
    pairsWith: 'Fried Yam, Boiled Cassava, Kenkey',
  },
  {
    id: 'shito-halal-beef',
    name: 'Nkor Shito Sauce - Halal Beef',
    spiceLevel: 'halal-beef',
    spiceLevelDisplay: 'Halal Beef',
    spiceRating: 3,
    description: 'Premium halal beef slow-cooked into our rich Shito base until deeply savory and smoky. A hearty, heritage-inspired sauce that brings Ghanaian soul to every bite.',
    image:'/nkor_eats_halal_beef.png',
    badge: 'Heritage Beef',
    pairsWith: 'Tuo Zaafi, Kontomire Stew, Ampesi',
  },
];

// ============================================================================
// KENTE STRIPE — reusable decorative divider
// ============================================================================

const KENTE_COLORS = ['#FF5A09', '#FFC83B', '#0B0C10', '#6A9A75', '#FFC83B', '#FF5A09'];

function KenteStripe({ flipped = false }: { flipped?: boolean }) {
  const colors = flipped ? [...KENTE_COLORS].reverse() : KENTE_COLORS;
  return (
    <div className="w-full h-2 flex">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="flex-1"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// NAVIGATION
// ============================================================================

function Navigation({
  cartCount,
  cartTotal,
  onCartClick,
  onLogoClick,
}: {
  cartCount: number;
  cartTotal: number;
  onCartClick: () => void;
  onLogoClick: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', href: '#shop' },
    { name: 'Our Heritage', href: '#heritage' },
    { name: 'Connect', href: '#connect' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${
        scrolled ? 'bg-base-black/90 border-base-slate' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button onClick={onLogoClick} className="flex items-center space-x-2 group">
            <div className="flex items-center">
              <Flame className="w-6 h-6 text-accent-orange" />
              <Leaf className="w-4 h-4 text-structural-green -ml-1" />
            </div>
            <div>
              <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight text-white group-hover:text-accent-orange transition-colors">
                Nkor Eats
              </span>
              <span className="hidden sm:block text-[9px] text-accent-gold uppercase tracking-widest -mt-1 ml-0.5">
                Authentic Shito Sauce
              </span>
            </div>
          </button>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-accent-orange transition-colors duration-200 font-medium text-sm uppercase tracking-wide"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCartClick}
              className="flex items-center space-x-3 px-4 py-2 bg-base-slate hover:bg-structural-border rounded-lg transition-colors border border-structural-border"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent-orange text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs text-gray-400 block">Basket</span>
                <span className="text-sm text-white font-bold">${cartTotal.toFixed(2)}</span>
              </div>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-base-slate rounded-xl mt-2 p-4 animate-fade-in border border-structural-border">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-gray-300 hover:text-accent-orange transition-colors font-medium uppercase tracking-wide text-sm border-b border-structural-border last:border-0"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col pt-16 md:pt-20 relative overflow-hidden bg-base-black">
      {/* Kente accent top */}
      <KenteStripe />

      <div className="flex-1 flex items-center relative">
        {/* Background glows */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text column */}
            <div className="text-center md:text-left">
              {/* Akwaaba badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-gold inline-block" />
                <span className="text-accent-gold text-xs font-bold uppercase tracking-widest">Akwaaba — Welcome</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Authentic Ghanaian{' '}
                <span className="text-accent-orange">Shito Sauce,</span>{' '}
                Crafted for Every Table.
              </h1>

              <p className="text-gray-400 text-lg my-6 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Small-batch, slow-simmered Shito rooted in true Ghanaian tradition. From banku and kenkey to jollof and fufu — Nkor makes every dish unforgettable.
              </p>

              {/* Ghana staples strip */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                {['Banku', 'Kenkey', 'Fufu', 'Waakye', 'Jollof'].map((dish) => (
                  <span key={dish} className="px-3 py-1 bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-xs font-semibold rounded-full">
                    {dish}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <a
                  href="#shop"
                  className="bg-accent-orange hover:bg-accent-orange-hover text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg shadow-accent-orange/25 flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <span>Shop the Collection</span>
                  <ChevronDown className="w-5 h-5" />
                </a>
                <a
                  href="#heritage"
                  className="border-2 border-accent-gold text-accent-gold px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:bg-accent-gold hover:text-base-black w-full sm:w-auto text-center"
                >
                  Our Story
                </a>
              </div>
            </div>

            {/* Image column */}
            <div className="relative group">
              <div className="relative">
                {/* Main hero image */}
                <div className="aspect-square rounded-2xl overflow-hidden ring-2 ring-accent-gold/30 bg-base-slate shadow-2xl">
                  <img
                    src="/nkor_eats_halal_beef.png"
                    alt="Nkor Eats — Authentic Shito Sauce"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-base-black/40 via-transparent to-transparent" />
                  {/* Kente top stripe on hero image */}
                  <div className="absolute top-0 left-0 right-0 h-2 flex">
                    {KENTE_COLORS.map((c, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Floating card — food plate */}
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-xl overflow-hidden ring-2 ring-accent-gold/40 shadow-xl hidden sm:block">
                  <img
                    src="/food_1.png"
                    alt="Banku and fish with Nkor Shito"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating card — open jar */}
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-xl overflow-hidden ring-2 ring-accent-orange/40 shadow-xl hidden sm:block">
                  <img
                    src="/pour_1.png"
                    alt="Nkor Spicy Shito Sauce"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-br from-accent-orange/20 via-accent-gold/10 to-structural-green/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Kente bottom */}
      <KenteStripe flipped />
    </section>
  );
}
// ============================================================================
// SPICE HEAT INDICATOR
// ============================================================================

function SpiceIndicator({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-accent-orange' : 'text-structural-border'}`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// SHITO PRODUCT CARD WITH VARIANT SELECTORS
// ============================================================================

function ShitoProductCard({
  product,
  onAddToCart,
}: {
  product: ShitoProduct;
  onAddToCart: (product: ShitoProduct, variants: SelectedVariants, price: number) => void;
}) {
  const [selectedSize, setSelectedSize] = useState<SizeVariant>('8 oz');
  const [selectedProtein, setSelectedProtein] = useState<ProteinVariant>('Plain (No Meat)');
  const [added, setAdded] = useState(false);

  const currentPrice = calculatePrice(selectedSize, selectedProtein);
  const hasProtein = selectedProtein !== 'Plain (No Meat)';

  const handleAddToCart = () => {
    onAddToCart(product, { size: selectedSize, protein: selectedProtein }, currentPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-base-slate rounded-2xl overflow-hidden ring-1 ring-structural-border hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col">
      {/* Product image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-black/90 via-base-black/30 to-transparent" />

        {/* Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-accent-orange text-white text-xs font-bold uppercase tracking-wide rounded-lg">
          {product.badge}
        </span>

        {/* Spice level top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-base-black/80 backdrop-blur-sm rounded-lg">
          {product.spiceRating === 0 ? (
            <span className="text-gray-400 text-[10px] font-bold uppercase">No Heat</span>
          ) : (
            <SpiceIndicator rating={product.spiceRating} />
          )}
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-base font-bold text-white leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-accent-gold text-[10px] font-bold uppercase tracking-widest mt-0.5">{product.spiceLevelDisplay}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{product.description}</p>

        {/* Pairs with */}
        <div className="flex items-start gap-1 flex-wrap">
          <span className="text-[10px] text-accent-gold font-bold uppercase tracking-wide shrink-0">Pairs:</span>
          <span className="text-[10px] text-gray-500">{product.pairsWith}</span>
        </div>

        {/* Size selector */}
        <div>
          <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1.5">
            Size
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {sizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedSize === size
                    ? 'bg-accent-orange text-white'
                    : 'bg-base-black text-gray-300 hover:bg-structural-border border border-structural-border'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Protein selector */}
        <div>
          <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1.5">
            Protein Topping
          </label>
          <select
            value={selectedProtein}
            onChange={(e) => setSelectedProtein(e.target.value as ProteinVariant)}
            className="w-full py-2 px-3 bg-base-black border border-structural-border rounded-lg text-white text-xs focus:outline-none focus:border-accent-orange transition-colors cursor-pointer"
          >
            {proteinOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Price + Add to basket */}
        <div className="flex items-end justify-between pt-1 border-t border-structural-border mt-auto">
          <div>
            <span className="text-2xl font-extrabold text-white">${currentPrice.toFixed(2)}</span>
            {hasProtein && (
              <span className="text-[10px] text-gray-500 block">+${PROTEIN_ADDONS[selectedSize].toFixed(2)} protein</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-1.5 ${
              added
                ? 'bg-structural-green text-white'
                : 'bg-accent-orange hover:bg-accent-gold hover:text-base-black text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCT CATALOG
// ============================================================================

function ProductCatalog({
  onAddToCart,
}: {
  onAddToCart: (product: ShitoProduct, variants: SelectedVariants, price: number) => void;
}) {
  const [filter, setFilter] = useState<'all' | SpiceLevel>('all');

  const filteredProducts = filter === 'all'
    ? shitoProducts
    : shitoProducts.filter((p) => p.spiceLevel === filter);

  return (
    <section id="shop" className="py-20 bg-base-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Kente bar */}
          <div className="flex justify-center gap-1 mb-5">
            {KENTE_COLORS.map((c, i) => (
              <div key={i} className="w-8 h-1.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-wide">
            Nkor Shito Sauce Collection
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Six bold varieties — all slow-simmered in the authentic Ghanaian tradition. Choose your heat level, size, and protein.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full font-semibold uppercase tracking-wide text-sm transition-all duration-200 ${
              filter === 'all'
                ? 'bg-accent-orange text-white shadow-lg shadow-accent-orange/25'
                : 'bg-base-slate text-gray-400 hover:text-white hover:bg-structural-border border border-structural-border'
            }`}
          >
            All Varieties
          </button>
          {shitoProducts.map((p) => (
            <button
              key={p.spiceLevel}
              onClick={() => setFilter(p.spiceLevel)}
              className={`px-5 py-2.5 rounded-full font-semibold uppercase tracking-wide text-sm transition-all duration-200 ${
                filter === p.spiceLevel
                  ? 'bg-accent-orange text-white shadow-lg shadow-accent-orange/25'
                  : 'bg-base-slate text-gray-400 hover:text-white hover:bg-structural-border border border-structural-border'
              }`}
            >
              {p.spiceLevelDisplay}
            </button>
          ))}
        </div>

        {/* 3-column grid for 6 products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ShitoProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CART DRAWER
// ============================================================================

function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-base-slate shadow-2xl z-50 animate-slide-in overflow-hidden flex flex-col">
        {/* Kente top */}
        <KenteStripe />

        <div className="flex items-center justify-between px-6 py-4 border-b border-structural-border">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">Your Basket</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-14 h-14 text-structural-border mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Your basket is empty</p>
              <p className="text-gray-600 text-sm mt-1">Akwaaba — add some Shito!</p>
              <button onClick={onClose} className="mt-4 text-accent-orange hover:text-accent-gold font-semibold transition-colors text-sm">
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-base-black rounded-xl ring-1 ring-structural-border">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-xs leading-tight line-clamp-2">
                    {item.product.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {item.variants.size} · {item.variants.protein}
                  </p>
                  <p className="text-accent-gold font-bold text-sm mt-1">${item.price.toFixed(2)}</p>

                  <div className="flex items-center mt-2 gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-6 h-6 flex items-center justify-center bg-base-slate hover:bg-structural-border disabled:opacity-40 rounded-md transition-colors"
                    >
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    <span className="w-5 text-center text-white font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-base-slate hover:bg-structural-border rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="ml-auto p-1 text-gray-500 hover:text-accent-orange transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-structural-border p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 uppercase tracking-wide text-sm font-semibold">Subtotal</span>
              <span className="text-white font-extrabold text-xl">${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="bg-accent-gold text-base-black hover:bg-white w-full py-3.5 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg text-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative bg-base-slate rounded-2xl p-8 max-w-md w-full animate-scale-in shadow-2xl ring-1 ring-structural-border overflow-hidden">
            <KenteStripe />
            <div className="pt-6 text-center">
              <button onClick={() => setShowCheckout(false)} className="absolute top-10 right-4 p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 bg-structural-green/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-structural-green" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Medaase!</h3>
              <p className="text-gray-400 text-sm mb-1">Thank you for your order</p>
              <p className="text-gray-400 mb-2">
                Total: <span className="text-accent-gold font-bold text-xl">${subtotal.toFixed(2)}</span>
              </p>
              <p className="text-xs text-gray-600 mt-3 px-4">
                This storefront is fully wired for payment integration.
              </p>
              <button
                onClick={() => { setShowCheckout(false); onClose(); }}
                className="mt-6 w-full bg-accent-orange hover:bg-accent-gold hover:text-base-black text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// HERITAGE SECTION
// ============================================================================

function HeritageSection() {
  return (
    <section id="heritage" className="bg-base-slate">
      <KenteStripe />
      <div className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden ring-2 ring-accent-gold/30 shadow-2xl">
                <img
                  src="/food_2.png"
                alt="Ghanaian waakye and sides"
                  className="w-full h-full object-cover"
                />
                {/* Kente overlay on image */}
                <div className="absolute top-0 left-0 right-0 h-2 flex">
                  {KENTE_COLORS.map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              {/* Floating inset */}
              <div className="absolute -bottom-6 -right-6 w-44 h-44 rounded-2xl overflow-hidden ring-2 ring-accent-orange/30 shadow-2xl hidden lg:block">
                <img
                 src="/pic_hold.png"
                 alt="Nkor Shito alignment asset"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-br from-accent-orange/15 via-accent-gold/10 to-structural-green/10 rounded-full blur-3xl" />
            </div>

            {/* Story */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block px-4 py-2 bg-accent-orange/20 text-accent-orange font-bold uppercase tracking-wide rounded-lg text-sm">
                  Yɛfrɛ Wo — Our Story
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 leading-tight">
                "Shito is not a condiment.<br />It is a culture."
              </h2>
              <div className="space-y-5 text-gray-400 leading-relaxed text-sm">
                <p>
                  Born from the kitchens of Ghana, Nkor Shito Sauce carries the soul of Accra's markets and the discipline of ancestral slow-cooking. Every jar begins with premium smoked herrings, wild crayfish, Scotch bonnet peppers, and native aromatics — simmered low and slow until the oil runs deep and dark.
                </p>
                <p>
                  We honor the elders who perfected this method before us. From waakye stands in Kumasi to jollof tables in Takoradi — Shito has always been there. Now Nkor brings it to your doorstep, never compromising, never cutting corners.
                </p>
              </div>

              {/* Ghanaian staples pairings */}
              <div className="mt-7 p-4 bg-base-black rounded-xl border border-structural-border">
                <p className="text-[10px] font-bold text-accent-gold uppercase tracking-widest mb-3">Made for Ghanaian Staples</p>
                <div className="flex flex-wrap gap-2">
                  {['Banku', 'Kenkey', 'Fufu', 'Waakye', 'Jollof Rice', 'Fried Yam', 'Kelewele', 'Ampesi', 'Tuo Zaafi'].map((dish) => (
                    <span key={dish} className="px-2.5 py-1 bg-accent-orange/10 text-accent-orange text-xs rounded-lg border border-accent-orange/20 font-medium">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-3 gap-5 mt-8">
                {[
                  { icon: <Flame className="w-6 h-6 text-accent-orange" />, bg: 'bg-accent-orange/20', title: 'Small Batch', sub: 'Production' },
                  { icon: <Star className="w-6 h-6 text-accent-gold" />, bg: 'bg-accent-gold/20', title: 'Ghana Made', sub: 'Recipe' },
                  { icon: <Leaf className="w-6 h-6 text-structural-green" />, bg: 'bg-structural-green/20', title: 'Natural', sub: 'Ingredients' },
                ].map(({ icon, bg, title, sub }) => (
                  <div key={title} className="text-center">
                    <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      {icon}
                    </div>
                    <div className="text-white font-bold text-xs">{title}</div>
                    <div className="text-gray-500 text-[10px] mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <KenteStripe flipped />
    </section>
  );
}

// ============================================================================
// CONTACT SECTION
// ============================================================================

function ContactSection() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const validate = () => {
    const e: { name?: string; email?: string; message?: string } = {};
    if (!formState.name.trim()) e.name = 'Name is required';
    if (!formState.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) e.email = 'Invalid email';
    if (formState.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormState({ name: '', email: '', message: '' });
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 bg-base-black border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all text-sm ${
      hasError
        ? 'border-red-500'
        : 'border-structural-border focus:border-accent-orange focus:ring-1 focus:ring-accent-orange'
    }`;

  return (
    <section id="connect" className="py-24 bg-base-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-wide">
            Connect With Us
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Questions about Nkor Shito? Wholesale enquiries? We'd love to hear from you — Medaase!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">Contact Information</h3>
            {[
              { Icon: Mail, label: 'Email', value: 'hello@nkoreats.com', href: 'mailto:hello@nkoreats.com' },
              { Icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
              { Icon: MapPin, label: 'Location', value: 'Atlanta, Georgia, USA', href: undefined },
            ].map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-start space-x-4">
                <div className="w-11 h-11 bg-accent-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent-orange" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{label}</div>
                  {href ? (
                    <a href={href} className="text-gray-400 hover:text-accent-gold transition-colors text-sm">{value}</a>
                  ) : (
                    <span className="text-gray-400 text-sm">{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-base-slate rounded-2xl p-6 md:p-8 ring-1 ring-structural-border">
            {isSubmitted ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-structural-green/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check className="w-10 h-10 text-structural-green" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Medaase — Thank You!</h3>
                <p className="text-gray-400 text-sm">We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {(['name', 'email'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                      {field === 'name' ? 'Full Name' : 'Email Address'}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={formState[field]}
                      onChange={(e) => setFormState({ ...formState, [field]: e.target.value })}
                      className={inputClass(!!errors[field])}
                      placeholder={field === 'name' ? 'Your full name' : 'your@email.com'}
                    />
                    {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">Message</label>
                  <textarea
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    rows={4}
                    className={`${inputClass(!!errors.message)} resize-none`}
                    placeholder="How can we help? (min 10 characters)"
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent-orange hover:bg-accent-gold hover:text-base-black text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  return (
    <footer className="bg-base-slate border-t border-structural-border">
      <KenteStripe />
      <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent-orange" />
            <div>
              <span className="text-base font-bold uppercase tracking-wide">
                <span className="text-white">Nkor</span>
                <span className="text-accent-gold"> Eats</span>
              </span>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">Authentic Shito Sauce</p>
            </div>
          </div>

          <nav className="flex items-center gap-8 text-xs">
            <a href="#shop" className="text-gray-400 hover:text-accent-orange transition-colors uppercase tracking-wide">Shop</a>
            <a href="#heritage" className="text-gray-400 hover:text-accent-orange transition-colors uppercase tracking-wide">Heritage</a>
            <a href="#connect" className="text-gray-400 hover:text-accent-orange transition-colors uppercase tracking-wide">Connect</a>
          </nav>

          <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Nkor Eats. Ghana Made.</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// APP
// ============================================================================

export default function NkorEatsApp() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: ShitoProduct, variants: SelectedVariants, price: number) => {
    const cartItemId = generateCartItemId(product.id, variants);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: cartItemId, product, variants, price, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: qty } : item));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const cartCount = cart.reduce((s, item) => s + item.quantity, 0);
  const cartTotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-base-black" style={{ backgroundColor: '#0B0C10' }}>
      <Navigation
        cartCount={cartCount}
        cartTotal={cartTotal}
        onCartClick={() => setIsCartOpen(true)}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <main>
        <HeroSection />
        <ProductCatalog onAddToCart={addToCart} />
        <HeritageSection />
        <ContactSection />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
