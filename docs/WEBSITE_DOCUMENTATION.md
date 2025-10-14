# AEROTECH Official Website - Documentation

## Overview
This document provides a comprehensive overview of the AEROTECH official website as of October 14, 2025.

## Website Structure

The AEROTECH website is a static HTML website showcasing unmanned aerial vehicle (UAV) platforms and related technologies. The site consists of the following main pages:

### 1. Home Page (index.html)
**Screenshot**: `docs/screenshots/screenshot-01-index-full.png`

The main landing page featuring:
- Hero section with canvas animation background
- Company philosophy and engineering approach
- Application areas for AEROTECH technologies
- Engineering principles and technical capabilities
- K1 platform showcase with specifications
- Photo gallery of current developments
- Project roadmap showing development progress
- Team recruitment section
- Contact form and partnership opportunities

Key Sections:
- **Hero**: "Беспилотные платформы для миссий без права на ошибку"
- **About**: Engineering philosophy and team information (Vladimir Letunovsky, 14 years old, Founder and Chief Engineer)
- **Applications**: Defense, Search & Rescue, Medical Logistics, Specialized Logistics, Commercial Logistics, Air Security
- **Technology**: Aerodynamic expertise, advanced materials, modular architecture, adaptive aerodynamics
- **K1 Platform**: Flagship platform with 120 min autonomy, 1cm positioning accuracy, IP68 protection
- **Gallery**: Images of K1 drone and 3D printer extruder
- **Projects**: K1 (20% complete), Intelligent flight control system (70% complete), Dynamic stability systems (10% complete), Next-gen composite materials (30% complete)
- **Careers**: Open positions for engineers and developers
- **Contact**: Partnership and inquiry form

### 2. K1 Platform Page (k1.html)
**Screenshot**: `docs/screenshots/screenshot-02-k1-full.png`

Detailed information about the K1 modular UAV platform:
- Platform overview and key specifications
- Modular architecture details
- Technical specifications table
- Gallery of K1 images
- Demo request CTA

Key Features:
- 120 minutes autonomous flight with 5kg payload
- 1cm positioning accuracy (RTK GPS/GLONASS + inertial stabilization)
- IP68 protection
- 40km range
- 12 m/s wind resistance
- < 4 min payload swap time
- Modular design with quick-swap payload mounts
- NVIDIA Orin NX computational module

### 3. Search & Rescue Page (sr.html)
**Screenshot**: `docs/screenshots/screenshot-03-sr-full.png`

Comprehensive S&R solution featuring:
- SR ecosystem overview
- K1 SAR configuration details
- СПАС-ХАБ (Command Hub) description
- Integration between aerial and ground systems
- Support for volunteers and NGOs

Key Components:
- **K1 SAR**: UAV platform with multispectral camera, thermal imager, and LIDAR
- **СПАС-ХАБ**: Command module with 3D mapping, tracking, and AI analysis
- **SPARX Link**: Communication protocol between K1 SAR and command hub
- Free provision for volunteer groups and NGOs in Russia, CIS countries, and humanitarian missions

### 4. Work In Progress Page (workinprogress.html)
**Screenshot**: `docs/screenshots/screenshot-04-workinprogress-full.png`

A maintenance/placeholder page stating "Мы обновляем инфраструктуру" (We are updating infrastructure).

Note: The `arlist-tech.html` page redirects to this work-in-progress page, indicating that ARLIST TECH content is currently under development.

### 5. Privacy Policy Page (privacy.html)
**Screenshot**: `docs/screenshots/screenshot-05-privacy-full.png`

Standard privacy policy page covering:
- General provisions
- Data collection and processing
- Data security
- User rights
- Policy changes
- Contact information
- Cookie information

## Technical Stack

### Frontend Technologies
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables, animations, and gradients
- **JavaScript**: Vanilla JS with classes for components
- **Fonts**: IBM Plex Mono and Montserrat from Google Fonts

### Key JavaScript Components
Located in `js/script.js`:
- `FeatureFlags`: Configuration for hiding certain elements/pages
- `HeroAnimation`: Canvas-based hero section animation
- `PageLoader`: Preloader functionality
- `Navigation`: Mobile/desktop navigation handling
- `ContactForm`: Contact form validation and submission
- `SmoothScroll`: Smooth scrolling behavior
- `ScrollAnimations`: Scroll-triggered animations
- `StickyObserver`: Sticky CTA observation
- `Lightbox`: Gallery lightbox functionality

### Styling
Located in `css/style.css`:
- CSS custom properties for theming
- Responsive design with media queries
- Dark color scheme with accent colors (cyan/teal)
- Advanced animations and transitions
- Grid and Flexbox layouts

## Current Status

### Feature Flags (as of current version)
```javascript
const FeatureFlags = {
    hideArlistBranding: true,        // Hide "Является частью концерна ARLIST TECH"
    hidePages: {
        arlist: true,                // Redirect to work-in-progress
        synergia: true,              // Hidden
        asa: true,                   // Hidden
    },
    hideCustomersMentions: true      // Hide customer/investor mentions
};
```

### Development Status
- **K1 Platform**: 20% complete - Aerodynamic testing phase
- **Intelligent Flight Control System**: 70% complete
- **Dynamic Stability Systems**: 10% complete - Research phase
- **Composite Materials**: 30% complete - Testing phase

## Assets

### Images
- K1 drone views (upper view, main view, disassembled view)
- 3D printer extruder
- Favicon and branding elements

### Videos
Video assets are referenced but stored in a `videos/` directory.

## External Links

### Forms
- Yandex Forms for demo requests and inquiries: `https://forms.yandex.ru/u/68e14d2084227c8bc2c7d282/?page=1`

### Repository
- GitHub: `https://github.com/AEROTECJH/aerotech-official-site`

### Contact
- Email: vladimir@letunovskiu.ru

## SEO & Meta Information

- Structured data (JSON-LD) for Organization and Product
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs
- Sitemap.xml
- Robots.txt

## Domain
- Primary domain: arlist.tech (as seen in CNAME and meta tags)

## Notes

1. The website emphasizes the young age of the founder (14 years old, 8th grade) as a unique selling point
2. The site has a strong focus on military/defense applications alongside civilian use cases
3. Russian Federation citizenship requirements are explicitly stated for partnerships
4. The site uses modern web technologies without heavy frameworks
5. All pages feature consistent branding and navigation
6. The site is fully responsive and mobile-friendly

## Summary

This is a professionally designed static website showcasing advanced UAV technology developed by a teenage engineer. The site combines technical specifications with compelling visuals and clear calls-to-action. The modular K1 platform is the centerpiece, with additional pages detailing specific applications (Search & Rescue) and future development plans.
