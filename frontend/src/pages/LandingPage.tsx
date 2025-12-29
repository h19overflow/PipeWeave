import {
  Navigation,
  HeroSectionNew,
  ProblemSection,
  HowItWorks,
  ProductShowcase,
  BenefitsGrid,
  FAQ,
  FinalCTA,
  FooterNew,
  GridBackground,
  CopilotButton,
} from '@/components/landing';

/**
 * Apple-style marketing landing page
 * Focus: VALUE over technical features
 *
 * Structure:
 * 1. Hero - Big headline with clear value proposition
 * 2. Problem - Pain points with subtle scroll animations
 * 3. How It Works - 3-step solution
 * 4. Product Showcase - Horizontal scroll-snap screens
 * 5. Benefits Grid - 6 value cards
 * 6. FAQ - Accordion with smooth animations
 * 7. Final CTA - Bottom conversion section
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--obsidian)] relative overflow-x-hidden">
      {/* Subtle grid background */}
      <GridBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <HeroSectionNew />

        {/* Problem Section */}
        <ProblemSection />

        {/* How It Works */}
        <HowItWorks />

        {/* Product Showcase */}
        <ProductShowcase />

        {/* Benefits Grid */}
        <BenefitsGrid />

        {/* FAQ */}
        <FAQ />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <FooterNew />

      {/* Floating Copilot Button */}
      <CopilotButton />
    </div>
  );
}
