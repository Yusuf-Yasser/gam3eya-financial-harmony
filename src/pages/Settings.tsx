
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Globe, 
  Moon,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  CreditCard
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profile_settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">{t('full_name')}</label>
                <Input placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium">{t('email')}</label>
                <Input placeholder="john@example.com" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium">{t('phone')}</label>
                <Input placeholder="+20 123 456 7890" type="tel" />
              </div>
            </div>
            <Button>{t('save_changes')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('language_settings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {language === 'en' ? 'English' : 'العربية'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('current_language')}
                </p>
              </div>
              <Button onClick={toggleLanguage} variant="outline">
                {language === 'en' ? 'تغيير إلى العربية' : 'Switch to English'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('notifications')}
            </CardTitle>
            <CardDescription>{t('manage_notifications')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">{t('email_notifications')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('receive_email_updates')}
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">{t('push_notifications')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('receive_push_notifications')}
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('security')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="mr-2 h-4 w-4" />
                {t('change_password')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                {t('manage_connected_accounts')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
