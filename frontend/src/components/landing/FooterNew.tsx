import { Link } from 'react-router-dom';
import { Network, Github, Twitter, FileText } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Schema Deduction', href: '/schema' },
      { label: 'Business Rules', href: '/business-rules' },
      { label: 'Pipeline Editor', href: '/pipeline-editor' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Tutorials', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: FileText, href: '#', label: 'Docs' },
];

export function FooterNew() {
  return (
    <footer className="border-t border-[var(--slate-800)] bg-[var(--obsidian)]">
      {/* Main Footer Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="size-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-indigo-900 flex items-center justify-center">
                <Network className="text-white w-5 h-5" />
              </div>
              <span className="text-white font-bold text-lg">MLE Workbench</span>
            </Link>
            <p className="text-[var(--slate-500)] text-sm mb-6 max-w-xs">
              Context-first ML engineering. Validate before you vectorize.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="size-10 rounded-lg bg-[var(--slate-900)] border border-[var(--slate-800)] flex items-center justify-center text-[var(--slate-400)] hover:text-white hover:border-[var(--slate-700)] transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-[var(--slate-500)] hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[var(--slate-500)] hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--slate-800)]">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[var(--slate-500)] text-sm">
            {new Date().getFullYear()} MLE Workbench. All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-[var(--slate-500)] hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[var(--slate-500)] hover:text-white transition-colors"
            >
              Terms
            </a>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--success)]" />
              <span className="text-[var(--slate-500)]">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
