import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Save, Send } from 'lucide-react';
import { SettingsSection } from '@/components/settings-section';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from '@/components/custom-toast';
import { Switch } from '@/components/ui/switch';

interface WhatsappCloudSettingsProps {
  settings?: Record<string, any>;
}

export default function WhatsappCloudSettings({ settings = {} }: WhatsappCloudSettingsProps) {
  const { t } = useTranslation();

  const getEnabledState = (val: any) => val === '1' || val === 1 || val === true || val === 'true';

  const [form, setForm] = useState(() => ({
    whatsapp_cloud_enabled: getEnabledState(settings.whatsapp_cloud_enabled),
    whatsapp_cloud_access_token: settings.whatsapp_cloud_access_token || '',
    whatsapp_cloud_phone_number_id: settings.whatsapp_cloud_phone_number_id || '',
    whatsapp_cloud_template_name: settings.whatsapp_cloud_template_name || 'new_order_notification',
    whatsapp_cloud_template_lang: settings.whatsapp_cloud_template_lang || 'fr',
    whatsapp_cloud_api_version: settings.whatsapp_cloud_api_version || 'v20.0',
  }));

  const [testNumber, setTestNumber] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setForm({
      whatsapp_cloud_enabled: getEnabledState(settings.whatsapp_cloud_enabled),
      whatsapp_cloud_access_token: settings.whatsapp_cloud_access_token || '',
      whatsapp_cloud_phone_number_id: settings.whatsapp_cloud_phone_number_id || '',
      whatsapp_cloud_template_name: settings.whatsapp_cloud_template_name || 'new_order_notification',
      whatsapp_cloud_template_lang: settings.whatsapp_cloud_template_lang || 'fr',
      whatsapp_cloud_api_version: settings.whatsapp_cloud_api_version || 'v20.0',
    });
  }, [settings]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(route('settings.whatsapp-cloud.update'), form, {
      preserveScroll: true,
      onError: (errors) => {
        const message = errors.error || Object.values(errors).join(', ') || t('Failed to update WhatsApp Cloud API settings');
        toast.error(message);
      }
    });
  };

  const sendTest = async () => {
    if (!testNumber) {
      toast.error(t('Enter a phone number first'));
      return;
    }
    setTesting(true);
    try {
      const response = await axios.post(route('settings.whatsapp-cloud.test'), { to: testNumber });
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('Failed to send test message'));
    }
    setTesting(false);
  };

  return (
    <SettingsSection
      title={t('WhatsApp Notifications')}
      description={t('Automatically alert sellers on WhatsApp when their store receives a new order, using Meta\'s official WhatsApp Cloud API')}
      action={
        <Button type="submit" form="whatsapp-cloud-settings-form" size="sm">
          <Save className="h-4 w-4 mr-2" />
          {t('Save Changes')}
        </Button>
      }
    >
      <form id="whatsapp-cloud-settings-form" onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-muted/20 border rounded-xl md:col-span-2">
            <div className="space-y-0.5">
              <Label htmlFor="whatsapp_cloud_enabled">{t('Enable seller order notifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('Send every seller a WhatsApp message whenever their store gets a new order')}
              </p>
            </div>
            <Switch
              id="whatsapp_cloud_enabled"
              checked={form.whatsapp_cloud_enabled}
              onCheckedChange={(checked) => handleChange('whatsapp_cloud_enabled', checked)}
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="whatsapp_cloud_access_token">{t('Access Token')}</Label>
            <Input
              id="whatsapp_cloud_access_token"
              type="password"
              value={form.whatsapp_cloud_access_token}
              onChange={(e) => handleChange('whatsapp_cloud_access_token', e.target.value)}
              placeholder={t('Permanent access token from Meta Business')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsapp_cloud_phone_number_id">{t('Phone Number ID')}</Label>
            <Input
              id="whatsapp_cloud_phone_number_id"
              value={form.whatsapp_cloud_phone_number_id}
              onChange={(e) => handleChange('whatsapp_cloud_phone_number_id', e.target.value)}
              placeholder={t('From your WhatsApp Business API app')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsapp_cloud_api_version">{t('Graph API Version')}</Label>
            <Input
              id="whatsapp_cloud_api_version"
              value={form.whatsapp_cloud_api_version}
              onChange={(e) => handleChange('whatsapp_cloud_api_version', e.target.value)}
              placeholder="v20.0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsapp_cloud_template_name">{t('Template Name')}</Label>
            <Input
              id="whatsapp_cloud_template_name"
              value={form.whatsapp_cloud_template_name}
              onChange={(e) => handleChange('whatsapp_cloud_template_name', e.target.value)}
              placeholder="new_order_notification"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsapp_cloud_template_lang">{t('Template Language Code')}</Label>
            <Input
              id="whatsapp_cloud_template_lang"
              value={form.whatsapp_cloud_template_lang}
              onChange={(e) => handleChange('whatsapp_cloud_template_lang', e.target.value)}
              placeholder="fr"
            />
          </div>

          <div className="md:col-span-2 p-4 bg-muted/20 border rounded-xl text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{t('Before this works, you need to')}</p>
            <p>1. {t('Create a WhatsApp Business app in Meta Business Manager and get a permanent access token + Phone Number ID')}</p>
            <p>2. {t('Create and get approved a message template with 3 body variables, e.g.')}: <span className="italic">"Nouvelle commande {'{{2}}'} chez {'{{1}}'} pour un montant de {'{{3}}'} FCFA."</span></p>
            <p>3. {t('Enter that exact template name and language above, then save')}</p>
          </div>

          <div className="grid gap-2 md:col-span-2 pt-2 border-t">
            <Label htmlFor="test_number">{t('Send a test notification')}</Label>
            <div className="flex gap-2">
              <Input
                id="test_number"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder={t('Phone number with country code')}
              />
              <Button type="button" variant="outline" onClick={sendTest} disabled={testing}>
                <Send className="h-4 w-4 mr-2" />
                {testing ? t('Sending...') : t('Send Test')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </SettingsSection>
  );
}
