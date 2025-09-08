// Navigation data structure for TrendDojo
export interface NavigationLink {
  href: string;
  label: string;
}

export interface CTAButton {
  href: string;
  label: string;
}

export const navigationLinks: NavigationLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/demo', label: 'Demo' },
  { href: '/blog', label: 'Blog' }
];

export const ctaButtons = {
  signIn: { href: '/login', label: 'Sign In' } as CTAButton,
  signup: { href: '/signup', label: 'Start Free Trial' } as CTAButton
};

// Footer navigation structure
export const footerSections = {
  platform: {
    title: 'Platform',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/demo', label: 'Live Demo' }
    ]
  },
  resources: {
    title: 'Resources',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/about', label: 'About' }
    ]
  },
  company: {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/contact', label: 'Contact' }
    ]
  }
};