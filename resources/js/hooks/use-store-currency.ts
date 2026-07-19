import { usePage } from '@inertiajs/react';

interface StoreCurrency {
  code: string;
  symbol: string;
  name: string;
  position: string;
  decimals: number;
  decimal_separator: string;
  thousands_separator: string;
}

interface PageProps {
  storeCurrency: StoreCurrency;
}

/**
 * Hook to access store-specific currency settings
 */
export function useStoreCurrency(): StoreCurrency {
  const { props } = usePage<PageProps>();
  
  return props.storeCurrency || {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'before',
    decimals: 2,
    decimal_separator: '.',
    thousands_separator: ','
  };
}

/**
 * Hook to format currency using store settings
 */
export function useCurrencyFormatter() {
  const storeCurrency = useStoreCurrency();
  
  return (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return `${storeCurrency.symbol} 0`;

    // Force 0 decimal places project-wide for shop
    const decimals = 0;
    const formattedNumber = numAmount.toFixed(decimals);
    
    // Split into integer and decimal parts
    const parts = formattedNumber.split('.');
    
    // Add thousands separator
    let thousandsSeparator = storeCurrency.thousands_separator;
    if (thousandsSeparator === ' ' || thousandsSeparator === 'space' || thousandsSeparator === '') {
      thousandsSeparator = ' ';
    }
    if (thousandsSeparator && thousandsSeparator !== 'none') {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    }

    // Join with decimal separator
    const finalNumber = parts.join(storeCurrency.decimal_separator);

    // Return with currency symbol in correct position
    return storeCurrency.position === 'after' 
      ? `${finalNumber} ${storeCurrency.symbol}`
      : `${storeCurrency.symbol} ${finalNumber}`;
  };
}