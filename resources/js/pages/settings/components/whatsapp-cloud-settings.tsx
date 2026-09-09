import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Save, Send, Plus, X } from 'lucide-react';
import { SettingsSection } from '@/components/settings-section';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from '@/components/custom-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WhatsappCloudSettingsProps {
  settings?: Record<string, any>;
  availableVariables?: Record<string, string>;
  availableLinkVariables?: Record<string, string>;
}

const DEFAULT_VARIABLES = ['store_name', 'order_no', 'final_total'];
const NO_LINK_VALUE = '__none__';

export default function WhatsappCloudSettings({ settings = {}, availableVariables = {}, availableLinkVariables = {} }: WhatsappCloudSettingsProps) {
  const { t } = useTranslation();

  const getEnabledState = (val: any) => val === '1' || val === 1 || val === true || val === 'true';

  const parseVariables = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fall through to default
      }
    }
    return [...DEFAULT_VARIABLES];
  };

  const buildForm = () => ({
    whatsapp_cloud_enabled: getEnabledState(settings.whatsapp_cloud_enabled),
    whatsapp_cloud_access_token: settings.whatsapp_cloud_access_token || '',
    whatsapp_cloud_phone_number_id: settings.whatsapp_cloud_phone_number_id || '',
    whatsapp_cloud_template_name: settings.whatsapp_cloud_template_name || 'new_order_notification',
    whatsapp_cloud_template_lang: settings.whatsapp_cloud_template_lang || 'fr',
    whatsapp_cloud_template_variables: parseVariables(settings.whatsapp_cloud_template_variables),
    whatsapp_cloud_link_variable: settings.whatsapp_cloud_link_variable || null,
  });

  const [form, setForm] = useState(buildForm);
  const [testNumber, setTestNumber] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setForm(buildForm());
  }, [settings]);

  const handleChange = (field: string, value: string | boolean | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const variableKeys = Object.keys(availableVariables);
  const firstAvailableKey = variableKeys[0] || '';

  const updateVariableAt = (index: number, value: string) => {
    setForm(prev => {
      const next = [...prev.whatsapp_cloud_template_variables];
      next[index] = value;
      return { ...prev, whatsapp_cloud_template_variables: next };
    });
  };

  const addVariable = () => {
    setForm(prev => ({
      ...prev,
      whatsapp_cloud_template_variables: [...prev.whatsapp_cloud_template_variables, firstAvailableKey],
    }));
  };

  const removeVariable = (index: number) => {
    setForm(prev => ({
      ...prev,
      whatsapp_cloud_template_variables: prev.whatsapp_cloud_template_variables.filter((_, i) => i !== index),
    }));
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

          <div className="grid gap-2 md:col-span-2">
            <Label>{t('Template Variables')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('For each {{n}} placeholder in your approved template, in order, choose what it should contain')}
            </p>
            <div className="space-y-2">
              {form.whatsapp_cloud_template_variables.map((key, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">{`{{${index + 1}}}`}</span>
                  <Select value={key} onValueChange={(value) => updateVariableAt(index, value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {variableKeys.map((varKey) => (
                        <SelectItem key={varKey} value={varKey}>
                          {availableVariables[varKey]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive"
                    onClick={() => removeVariable(index)}
                    disabled={form.whatsapp_cloud_template_variables.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addVariable}>
              <Plus className="h-4 w-4 mr-2" />
              {t('Add a variable')}
            </Button>
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label>{t('Order Link Button')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('If your template defines a dynamic URL button, choose what fills it — your template must define a dynamic URL button for this to work')}
            </p>
            <Select
              value={form.whatsapp_cloud_link_variable || NO_LINK_VALUE}
              onValueChange={(value) => handleChange('whatsapp_cloud_link_variable', value === NO_LINK_VALUE ? null : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LINK_VALUE}>{t('No button')}</SelectItem>
                {Object.keys(availableLinkVariables).map((varKey) => (
                  <SelectItem key={varKey} value={varKey}>
                    {availableLinkVariables[varKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 p-4 bg-muted/20 border rounded-xl text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{t('Before this works, you need to')}</p>
            <p>1. {t('Create a WhatsApp Business app in Meta Business Manager and get a permanent access token + Phone Number ID')}</p>
            <p>2. {t('Create and get approved a message template on Meta, with one {{n}} placeholder per variable you configure below')}</p>
            <p>3. {t('Enter that exact template name and language above, and match each {{n}} to the variables below in the same order')}</p>
            <p>4. {t('If your template has a dynamic URL button, add it as a "Visit website" button of type Dynamic, with your orders URL as the base and one variable at the end (e.g. https://mystoreasap.com/orders/{{1}}), then select what fills it above')}</p>
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
