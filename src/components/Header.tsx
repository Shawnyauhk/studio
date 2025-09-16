
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, HardDrive, Menu, LogOut, Languages } from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from './ui/button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTranslation } from '@/hooks/use-translation';


export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, setLanguage, language } = useTranslation();

  const navItems = [
    { href: '/dashboard', label: t('myCard') },
    { href: '/dashboard/saved-cards', label: t('savedCards') },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  }

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
              // Use a more specific selector for hover to avoid overwriting active state
              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
          )}
        >
          {item.label === t('myCard') && <User className="h-4 w-4" />}
          {item.label === t('savedCards') && <HardDrive className="h-4 w-4" />}
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
                <SheetHeader>
                   <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                </SheetHeader>
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
           {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>{t('language')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setLanguage('en')}>
                        English {language === 'en' && <span className="ml-auto">✔</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage('zh')}>
                        繁體中文 {language === 'zh' && <span className="ml-auto">✔</span>}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logOut')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
