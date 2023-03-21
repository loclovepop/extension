import React, { useEffect, useState } from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  useTranslate,
  BlockStack,
  Divider,
  Heading,
  InlineLayout,
  SkeletonImage,
  SkeletonText,
  Button,
  useCartLines,
  Image,
  Text,
  useApplyCartLinesChange,
  useSettings
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::Dynamic::Render', () => <App />);

const getProductsQuery = {
  query: `query ($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        images(first:1){
          nodes {
            url
          }
        }
        variants(first: 1) {
          nodes {
            id
            price {
              amount
            }
          }
        }
      }
    }
  }`,
  variables: { first: 5 },
};

const apiVersion = '2023-01';

function App() {
  const { extensionPoint, i18n } = useExtensionApi();
  const translate = useTranslate();

  const { shop } = useExtensionApi();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const lines = useCartLines();
  const [showError, setShowError] = useState(false);
  const settings = useSettings();
  // Get a reference to the function that will apply changes to the cart lines from the imported hook
  const applyCartLinesChange = useApplyCartLinesChange();

  useEffect(() => {
    setLoading(true);
    fetch(
      `${shop.storefrontUrl}api/${apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': ''
        },
        body: JSON.stringify(getProductsQuery),
      },
    )
      .then((res) => {
        // Set the "products" array so that you can reference the array items
        return res.text();
      }).then((res) => {
        var result = JSON.parse(res)
        setProducts(result.data.products.nodes);
      })
      .catch((error) => setShowError(error))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  const cartLineProductVariantIds = lines.map((item) => item.merchandise.id);
  const productsOnOffer = products.filter(
    (product) => {
      const isProductVariantInCart = product.variants.nodes.some(
        ({ id }) => cartLineProductVariantIds.includes(id)
      );
      return !isProductVariantInCart;
    }
  );

  if (!productsOnOffer.length) {
    return null;
  }

  const { images, title, variants } = productsOnOffer[0];

  const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);

  const imageUrl = images.nodes[0]?.url
    ?? "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";


  if (loading) {
    return (
      <BlockStack spacing="loose">
        <Divider />
        <Heading level={2}>You might also like</Heading>
        <BlockStack spacing="loose">
          <InlineLayout
            spacing="base"
            columns={[64, "fill", "auto"]}
            blockAlignment="center"
          >
            <SkeletonImage aspectRatio={1} />
            <BlockStack spacing="none">
              <SkeletonText inlineSize="large" />
              <SkeletonText inlineSize="small" />
            </BlockStack>
            <Button kind="secondary" disabled={true}>
              Add
            </Button>
          </InlineLayout>
        </BlockStack>
      </BlockStack>
    );
  }

  if (showError) {
    return (
      <Banner status="critical">
        There was an issue adding this product. Please try again.
      </Banner>
    );
  }

  if (!showError && !loading) {
    return (
      <BlockStack spacing="loose">
        <Divider />
        <Heading level={1}>You might also like</Heading>
        <BlockStack spacing="loose">
          <InlineLayout
            spacing="base"
            // Use the `columns` property to set the width of the columns
            // Image: column should be 64px wide
            // BlockStack: column, which contains the title and price, should "fill" all available space
            // Button: column should "auto" size based on the intrinsic width of the elements
            columns={[64, "fill", "auto"]}
            blockAlignment="center"
          >
            <Image
              border="base"
              borderWidth="base"
              borderRadius="loose"
              source={imageUrl}
              aspectRatio={1}
            />
            <BlockStack spacing="none">
              <Text size="medium" emphasis="bold">
                {title}
              </Text>
              <Text appearance="subdued">{renderPrice}</Text>
            </BlockStack>
            <Button
              kind="secondary"
              loading={adding}
              accessibilityLabel={`Add ${title} to cart`}
              onPress={async () => {
                setAdding(true);
                const result = await applyCartLinesChange({
                  type: "addCartLine",
                  merchandiseId: variants.nodes[0].id,
                  quantity: 1,
                });
                setAdding(false);
                if (result.type === "error") {
                  setShowError(true);
                  console.error(result.message);
                }
              }}
            >
              Add
            </Button>
          </InlineLayout>
        </BlockStack>
        {showError && (
          <Banner status="critical">
            There was an issue adding this product. Please try again.
          </Banner>
        )}
      </BlockStack>
    );
  }

}

