import { PageCrudWrapper } from '@/components/PageCrudWrapper';
import { currenciesConfig } from '@/config/crud/currencies';
import { useTranslation } from 'react-i18next';

export default function CurrenciesPage() {
  const { t } = useTranslation();
  return (
    <PageCrudWrapper
      config={currenciesConfig}
      title={t("Devises")}
      url="/currencies"
    />
  );
}