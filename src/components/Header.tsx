
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, HardDrive, LogOut, Languages, UserPlus } from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTranslation } from '@/hooks/use-translation';


const LanguageSwitcher = () => {
  const { t, setLanguage, language } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          English {language === 'en' && <span className="ml-auto">✔</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('zh')}>
          繁體中文 {language === 'zh' && <span className="ml-auto">✔</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header() {
  const pathname = usePathname();
  const { user, logout, addAnotherAccount } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { href: '/', label: t('myCard'), icon: User },
    { href: '/dashboard/saved-cards', label: t('savedCards'), icon: HardDrive },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  }

  const NavLinks = () => (
     <nav className="flex items-center gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
  
  const UserProfile = () => {
    if (!user) return null;

    return (
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
           <DropdownMenuItem onClick={addAnotherAccount}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>{t('addAnotherAccount')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('logOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <span className="font-headline text-xl font-bold hidden sm:inline-block">BizCard</span>
            </Link>
            <div className="hidden md:flex">
               <NavLinks />
            </div>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
