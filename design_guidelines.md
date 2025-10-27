# Design Guidelines: Bakery Bites - Gen-Z Aesthetic Bakery Website

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern Gen-Z brands like Glossier, Parade, and contemporary bakery sites with Instagram-first aesthetics. The design prioritizes mobile-first responsiveness, vibrant visuals, and social media integration.

## Core Design Principles
1. **Mobile-First Progressive Enhancement**: All layouts start with mobile optimization and scale up
2. **Gen-Z Visual Language**: Playful, colorful, gradient-rich with soft, approachable aesthetics
3. **Touch-Optimized**: All interactive elements sized for finger taps (minimum 44x44px)
4. **Instagram-Centric**: Seamless social media integration as primary brand channel

## Typography System
- **Primary Font**: Poppins (Google Fonts) - modern, rounded, Gen-Z friendly
- **Hierarchy**:
  - Logo/Hero Headlines: 2.5rem mobile / 4rem desktop, Bold (700)
  - Section Headers: 1.75rem mobile / 2.5rem desktop, SemiBold (600)
  - Subheadings: 1.25rem mobile / 1.5rem desktop, Medium (500)
  - Body Text: 1rem, Regular (400)
  - Buttons/CTAs: 1rem, SemiBold (600)

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm

**Responsive Breakpoints**:
- Mobile: base (< 640px) - single column layouts
- Tablet: md (768px) - 2-3 column grids
- Desktop: lg (1024px) - 4 column grids, expanded nav
- Large: xl (1280px) - maximum width containers

**Container Strategy**:
- Full-width sections: w-full with inner max-w-7xl px-4
- Content sections: max-w-6xl mx-auto px-6
- Forms: max-w-2xl mx-auto

## Color Palette (Gen-Z Optimized)
**Note**: While specific colors will be defined later, the palette structure includes:
- Pastel pinks (primary brand accent)
- Sage greens (secondary accent)
- Warm neutrals (backgrounds, text)
- Brown tones (CTAs, emphasis elements)
- Gradient overlays (hero, cards, buttons)

## Component Library

### Navigation Bar
- **Desktop**: Horizontal layout with logo left, Instagram link and menu items right
- **Mobile**: Hamburger menu (animated to X on open), full-screen overlay menu
- **Logo Text**: "100% EGGLESS - Bakery bites21 - BAKING HOUSE" (scalable typography)
- **Sticky positioning** on scroll with subtle shadow
- **Height**: 80px desktop / 64px mobile

### Instagram Pop-Up Modal
- **Trigger**: Appears 2 seconds after page load (first visit only, cookie-based)
- **Design**: Centered modal with backdrop blur, Instagram icon, follow CTA
- **Content**: Profile preview, "Follow us @bakery_bites21", direct link button
- **Size**: 400px max-width, responsive padding
- **Close**: X button top-right, click outside to dismiss

### Hero Section - Auto-Playing Slideshow
- **Height**: 70vh mobile / 80vh desktop (maintains visibility without forcing full viewport)
- **Slideshow**: Auto-advance every 5 seconds, smooth fade transitions
- **Images**: High-quality cake photos (4-6 images recommended)
- **Overlay**: Subtle gradient overlay for text readability
- **Content**: Centered text with primary headline, subheadline, "Order Now" CTA
- **CTA Button**: Large (px-8 py-4), blurred background, prominent placement
- **Navigation**: Dot indicators bottom-center, optional arrow controls

### Most Popular Section
- **Grid Layout**:
  - Mobile: 1 column, full-width cards
  - Tablet: 2 columns with gap-6
  - Desktop: 4 columns with gap-8
- **Cards**: Rounded corners (rounded-2xl), soft shadows, image top with product info below
- **Hover Effect**: Subtle lift (translateY(-4px)), enhanced shadow
- **Content**: Product image, name, short description, price badge
- **Images**: Square aspect ratio (1:1), high-quality product photos

### Our Choice Section
- **Layout**: Featured grid highlighting chef recommendations and signature items
- **Design**: Larger hero card + supporting cards grid
- **Badge**: "Chef's Choice" or "Signature" label overlay on featured items
- **Responsive**: 1 column mobile / 2-3 columns tablet-desktop

### Customized Cake Order Form
- **Layout**: Vertical form, max-width container
- **Fields**: 
  - Cake Type (dropdown)
  - Size/Weight (radio buttons or dropdown)
  - Flavor Selection (multi-select or chips)
  - Custom Message (textarea)
  - Delivery Date (date picker, touch-friendly)
  - Contact Info (name, phone, email)
- **Input Styling**: Rounded borders, ample padding (py-3 px-4), clear labels above
- **Mobile**: Full-width inputs, large touch targets
- **Submit**: Brown background button, full-width on mobile

### Ready-to-Order Catalog
- **Category Filters**: Horizontal scrollable chips on mobile, tabbed interface on desktop
- **Product Grid**: Same responsive pattern as Most Popular (1/2/4 columns)
- **Product Cards**: Image gallery support (swipeable on mobile), quick view option
- **Categories**: Cakes, Cupcakes, Pastries, Custom Orders

### Contact Us Section
- **Form Layout**: Vertical, centered, max-w-2xl
- **Fields**:
  - Name (text input)
  - Email (email input with validation)
  - Message (textarea, min-height 150px)
- **Submit Button**: Brown background, full-width on mobile, "Send Message" text
- **Responsive**: py-12 mobile / py-20 desktop section padding

### Online Order Booking
- **Phone Integration**: Click-to-call link for +91 8788463432 (tel: protocol)
- **Display**: Large, prominent phone number with phone icon
- **Mobile**: Direct tap-to-call functionality
- **Desktop**: Display number with WhatsApp/SMS options

### Google Maps Integration
- **Location**: 17°41'06.0"N 73°59'25.7"E embedded map
- **Height**: 400px mobile / 500px desktop
- **Styling**: Rounded corners, soft shadow
- **Responsive**: Full-width with container padding

### Admin Panel (/admin)
- **Route**: /admin with password protection (session-based)
- **Dashboard Layout**: Sidebar navigation (collapsible on mobile), main content area
- **Photo/Video Upload**:
  - Drag-and-drop zone with visual feedback
  - File preview thumbnails
  - Progress indicators
  - Category assignment
- **Slideshow Management**: Reorder images (drag-and-drop), set timing, enable/disable slides
- **Content Management**: Edit text, manage categories, update products
- **Mobile**: Hamburger menu for admin nav, touch-optimized controls

### Footer
- **Layout**: Multi-column on desktop (About, Quick Links, Contact, Social), stacked on mobile
- **Copyright**: "© 2023 Bakery Bites. All rights reserved." - centered, small text
- **Social Links**: Instagram prominent, other social icons
- **Responsive**: Full-width, adaptive column count

## Design Elements & Patterns

### Rounded Corners
- Cards: rounded-2xl (1rem)
- Buttons: rounded-full
- Images: rounded-xl (0.75rem)
- Inputs: rounded-lg (0.5rem)

### Shadows
- Resting cards: subtle shadow (shadow-md)
- Hover states: enhanced shadow (shadow-xl)
- Modals: deep shadow (shadow-2xl)

### Gradients
- Hero overlay: soft gradient for text contrast
- Button accents: subtle gradient backgrounds
- Section dividers: optional gradient lines

### Animations
- **Slideshow**: Smooth fade transitions (1s duration)
- **Scroll Animations**: Fade-in on scroll for section reveals (use Intersection Observer)
- **Hover Effects**: Smooth transitions (transition-all duration-300)
- **Touch Gestures**: Swipeable carousels, pull-to-refresh feel
- **Modal**: Fade-in backdrop, scale-in content

## Images

### Hero Slideshow Images (4-6 images)
1. Beautifully decorated birthday cake with vibrant frosting
2. Close-up of signature cupcakes arrangement
3. Elegant wedding cake multi-tier display
4. Colorful macarons and pastries spread
5. Custom cake with intricate design details
6. Bakery interior or baking process shot

### Product Photography
- Square format (1:1 ratio), minimum 800x800px
- Bright, natural lighting with soft shadows
- Clean backgrounds (white or pastel)
- Multiple angles for catalog items

### Placeholder Strategy
Use placeholder images initially with descriptive alt text, replace with client-provided high-quality bakery photos

## Responsive Behavior
- **Navigation**: Hamburger menu < 1024px
- **Grids**: 1 column mobile → 2 columns tablet → 4 columns desktop
- **Typography**: Scale down 20-30% on mobile
- **Spacing**: Reduce section padding by 40% on mobile
- **Forms**: Full-width inputs on mobile, max-width on desktop
- **Maps**: Maintain aspect ratio, adjust height

## Accessibility
- Touch targets minimum 44x44px
- High contrast text (WCAG AA minimum)
- Form labels clearly associated with inputs
- Focus states visible on all interactive elements
- Alt text on all images
- Semantic HTML structure

This design creates a vibrant, mobile-optimized Gen-Z aesthetic that prioritizes visual appeal, social integration, and seamless user experience across all devices.