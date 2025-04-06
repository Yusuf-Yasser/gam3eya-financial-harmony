
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  PieChart, 
  BarChart3, 
  Users, 
  Settings,
  LogOut 
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, path, active, onClick }: SidebarItemProps) => {
  const { language } = useLanguage();
  
  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
            active 
              ? "bg-masareef-primary text-white" 
              : "hover:bg-masareef-light/50 text-gray-700"
          )}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
      </button>
    );
  }
  
  return (
    <Link to={path} className="w-full">
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
          active 
            ? "bg-masareef-primary text-white" 
            : "hover:bg-masareef-light/50 text-gray-700"
        )}
      >
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

export function Sidebar() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`w-64 border-r bg-white h-screen flex flex-col ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-masareef-primary">Masareef</h1>
        <p className="text-xs text-muted-foreground">
          {language === 'ar' ? 'تتبع ذكي للميزانية والمصاريف' : 'Smart Budget & Expense Tracker'}
        </p>
      </div>
      
      <div className="flex-1 px-3 py-4 space-y-1">
        <SidebarItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label={t('dashboard')} 
          path="/"
          active={isActive('/')}
        />
        <SidebarItem 
          icon={<Receipt className="w-5 h-5" />} 
          label={t('transactions')} 
          path="/transactions"
          active={isActive('/transactions')}
        />
        <SidebarItem 
          icon={<PieChart className="w-5 h-5" />} 
          label={t('budgets')} 
          path="/budgets"
          active={isActive('/budgets')}
        />
        <SidebarItem 
          icon={<Wallet className="w-5 h-5" />} 
          label={t('wallets')} 
          path="/wallets"
          active={isActive('/wallets')}
        />
        <SidebarItem 
          icon={<Users className="w-5 h-5" />} 
          label={t('gam3eya')} 
          path="/gam3eya"
          active={isActive('/gam3eya')}
        />
        <SidebarItem 
          icon={<BarChart3 className="w-5 h-5" />} 
          label={t('reports')} 
          path="/reports"
          active={isActive('/reports')}
        />
        <SidebarItem 
          icon={<Receipt className="w-5 h-5" />} 
          label={t('reminders')} 
          path="/reminders"
          active={isActive('/reminders')}
        />
      </div>
      
      <div className="px-3 py-4 border-t space-y-1">
        <SidebarItem 
          icon={<Settings className="w-5 h-5" />} 
          label={t('settings')} 
          path="/settings"
          active={isActive('/settings')}
        />
        <SidebarItem 
          icon={<LogOut className="w-5 h-5" />} 
          label={t('logout')} 
          path="#"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}
