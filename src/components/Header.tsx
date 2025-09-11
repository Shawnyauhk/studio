'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Home, User, Menu } from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from './ui/button';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/scan', label: 'Scan Card', icon: Camera },
  { href: '/dashboard/profile', label: 'My Card', icon: User },
];

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const NavLinks = ({isMobile = false}: {isMobile?: boolean}) => (
    <nav className={cn("flex items-center gap-4", isMobile ? "flex-col items-start gap-4" : "hidden md:flex")}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setSheetOpen(false)}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-headline text-xl font-bold">BizCard</span>
        </Link>
        
        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px]">
                <div className="p-4">
                  <Link href="/dashboard" className="flex items-center gap-2 mb-8" onClick={() => setSheetOpen(false)}>
                    <Logo className="h-8 w-8" />
                    <span className="font-headline text-xl font-bold">BizCard</span>
                  </Link>
                  <NavLinks isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <NavLinks />
        </div>
      </div>
    </header>
  );
}
