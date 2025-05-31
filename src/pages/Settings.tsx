
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { 
  Globe, 
  User,
  Mail,
  Lock,
  Shield,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UpdateProfileData } from "@/types";
import ChangePasswordDialog from "@/components/dialogs/ChangePasswordDialog";

const Settings = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || ''
    }
  });

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      setIsSubmitting(true);
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                      disabled={isSubmitting}
                      {...register("username", { required: t('username_required') as string })}
                    />
                    {errors.username && <p className="text-destructive text-sm mt-1">{errors.username.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('email')}</label>
                    <Input 
                      placeholder="Email" 
                      type="email" 
                      disabled={isSubmitting}
                      {...register("email", { 
                        required: t('email_required') as string, 
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('invalid_email') as string
                        }
                      })}
                    />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('saving') : t('save_changes')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSubmitting}
                    onClick={() => {
                      reset({
                        username: user?.username || '',
                        email: user?.email || ''
                      });
                      setIsEditing(false);
                    }}
                  >
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
            <CardDescription>
              {t('language_preference_client_side')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {language === 'en' ? t('english') : t('arabic')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('current_language')}
                </p>
              </div>
              <Button onClick={toggleLanguage} variant="outline">
                {language === 'en' ? t('switch_to_arabic') : t('switch_to_english')}
              </Button>
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
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                {t('change_password')}
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
      <ChangePasswordDialog 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
    </div>
  );
};

export default Settings;
