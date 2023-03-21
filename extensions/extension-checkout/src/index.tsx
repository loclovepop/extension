import React from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  useTranslate,
  useCartLines,
  BlockSpacer,
  Tag,
  List,
  BlockStack,
  View,
  useExtensionData,
  useTarget,
  Pressable,
  InlineLayout,
  Icon,
  Tooltip,
  extend,
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::CartLineDetails::RenderAfter', () => <App />);

function App() {
  const { extensionPoint } = useExtensionApi();
  const items = useCartLines();
  const target = useTarget();
  const translate = useTranslate();
  const line = items.filter(x => x.id.substring(x.id.lastIndexOf('/') + 1) == target.id.substring(target.id.lastIndexOf('/') + 1))[0];

  const createTagProperties = (icon, value) => {
    return (
      <Pressable border="none" cornerRadius="none" padding="none" overlay={
        <Tooltip>
          {value}
        </Tooltip>
      }>
        <InlineLayout columns={['fill', 'auto']}>
          <Tag icon={icon}>{value}</Tag>
        </InlineLayout>
      </Pressable>
    )
  }

  const renderProperties = (attributes) => {
    var message = attributes.find((customProps) => (customProps.key == 'message' ? true : false))
      ? createTagProperties('giftFill', 'Message: ' + attributes.find((customProps) => customProps.key == 'message').value)
      : null;
    var recipient_address = attributes.find((customProps) =>
      customProps.key == 'recipient_address' ? true : false
    )
      ? createTagProperties('delivered', 'Recipient Address: ' + attributes.find((customProps) => customProps.key == 'recipient_address').value)
      : null;

    var scheduled_for = attributes.find((customProps) => (customProps.key == 'delivery_date' ? true : false))
      ? createTagProperties('calendar', 'Scheduled For: ' + new Date(attributes.find((customProps) => customProps.key == 'delivery_date').value.split('T')[0]).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }))
      : null;

    return <>{message} {recipient_address} {scheduled_for}</>
  }

  return (
    <BlockStack spacing={'tight'}>
      {line && renderProperties(line.attributes)}
    </BlockStack>
  )
}