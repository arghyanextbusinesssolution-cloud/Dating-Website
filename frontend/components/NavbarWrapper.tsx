"use client";

import { Navbar, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle } from '@/components/ui/resizable-navbar';
import { SpiritualUnityLogo } from '@/components/SpiritualUnityLogo';
import { useState } from 'react';

export default function NavbarWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', link: '/' },
    { name: 'About Us', link: '/about' },
    { name: 'How It Works', link: '/how-it-works' },
    { name: 'Pricing', link: '/plans' },
    { name: 'Contact Us', link: '/contact' },
  ];

  return (
    <Navbar className="z-50">
      <NavBody>
        <SpiritualUnityLogo />
        <NavItems items={navItems} />
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <SpiritualUnityLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item) => (
            <a key={item.name} href={item.link} onClick={() => setIsOpen(false)} className="block px-4 py-2 text-neutral-600 dark:text-neutral-300">
              {item.name}
            </a>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}