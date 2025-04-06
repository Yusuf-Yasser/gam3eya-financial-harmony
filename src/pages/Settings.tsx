
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { 
  Bell, 
  Globe, 
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  CreditCard,
  LogOut
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      phone: ''
    }
  });

  const onSubmit = (data) => {
    // In a real app, you would update the user profile here
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

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
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">{t('username')}</label>
                    <Input 
                      placeholder="Username" 
                      {...register("username", { required: "Username is required" })}
                    />
                    {errors.username && <p className="text-destructive text-sm mt-1">{errors.username.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('email')}</label>
                    <Input 
                      placeholder="Email" 
                      type="email" 
                      {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('phone')}</label>
                    <Input 
                      placeholder="+20 123 456 7890" 
                      type="tel" 
                      {...register("phone")}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{t('save_changes')}</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">{t('username')}</label>
                    <div className="mt-1 p-2 border rounded bg-muted/20">{user?.username || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('email')}</label>
                    <div className="mt-1 p-2 border rounded bg-muted/20">{user?.email || 'N/A'}</div>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)}>{t('edit_profile')}</Button>
              </div>
            )}
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
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
