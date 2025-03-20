
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Bell, Menu, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set RTL direction based on language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  
  if (language === 'ar') {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }

  return (
    <div className={`min-h-screen flex ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {!isMobile ? (
        <Sidebar />
      ) : (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="absolute top-3 left-3 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={language === 'ar' ? 'right' : 'left'} className="p-0 w-64">
            <div className="h-full">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      <div className="flex flex-col flex-1">
        <header className="bg-white border-b h-16 px-4 sm:px-6 flex items-center justify-between">
          {isMobile && (
            <div className="w-8" /> /* Placeholder for proper alignment */
          )}
          
          <div className="relative w-full max-w-xs sm:w-64 mx-auto sm:mx-0">
            <Search className={`absolute ${language === 'ar' ? 'right-2' : 'left-2'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
            <Input
              placeholder={t('search')}
              className={`${language === 'ar' ? 'pr-8' : 'pl-8'} h-9 w-full`}
            />
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
            <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
              <Link to="/reminders">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <LanguageToggle />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-3 sm:p-6 bg-background">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
