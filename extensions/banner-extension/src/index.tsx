import React from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  useTranslate,
  useSettings,
  Status,
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::Dynamic::Render', () => <App />);

function App() {
  const { extensionPoint } = useExtensionApi();
  const translate = useTranslate();
  const settings = useSettings();
  const status = settings.banner_status as Status;
  const title = settings.banner_title;
  const description = settings.banner_title as string;

  return (
    <Banner status={status || 'info'} title={description || "upsell-prod"}>
      {title || translate('welcome', { extensionPoint })}
    </Banner>
  );
}