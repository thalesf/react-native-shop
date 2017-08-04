import { Flex, Text } from "antd-mobile";
import * as React from "react";
import { compose, gql, graphql } from "react-apollo";
import { ScrollView, StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { IData } from "../../../model";
import { Loading } from "../../layout/index";
import { ACTION_SELECT_SUBPRODUCT } from "../constants";
import { Images, ProductBuy, ProductInfo } from "../index";
import { ICurrentProduct, IProduct, ISubProduct } from "../model";

// const PRODUCT_QUERY = require("./product.gql");
const PRODUCT_QUERY = `
query product($id: Int) {
  product(id: $id) {
    id
    name
    shortDescription
    description
    brand {
      id
      name
    }
    category {
      id
      name
    }
    images {
      id
      src
      width
      height
      colorValue
      colorName
      isTitle
    }
    subProducts {
      id
      article
      price
      oldPrice
      discount
      attributes {
        name
        values {
          id
          name
          value
          description
        }
      }
    }
    attributes {
      id
      name
      values {
        name
        description
      }
    }
  }
}

`;

// const styles = require("./styles.css");
const styles = StyleSheet.create({
  productContainer: {},

  productMainScreen: {
    alignContent: "center"
  },

  header: {
    height: 40,
    backgroundColor: "skyblue"
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 20,
    textAlign: "center"
  },

  productTop: {
    backgroundColor: "blue",
    height: 40
  },

  productTopBack: {},
  productContent: {
    backgroundColor: "white"
  },
  categoryName: {
    textAlign: "center"
  },
  productName: {}
});

interface IDataProduct extends IData {
  product: IProduct;
}

interface IConnectedProductProps {
  data: IDataProduct;
  product: ICurrentProduct;
  dispatch: Dispatch<{}>;
}

interface IProductProps {
  id: string;
  isModal: boolean;
  subProductId: any;
  navigation: any;
}

const options = {
  options: props => ({
    variables: {
      id: props.id
    }
  })
};

const getActiveSubProduct = (subProducts, subProductId): ISubProduct => {
  return subProducts.filter(sp => sp.id === subProductId)[0] || subProducts[0];
};

function createMarkup(html) {
  return { __html: html };
}

class Product extends React.Component<
  IConnectedProductProps & IProductProps,
  any
> {
  // componentWillMount() {
  //   const { dispatch, id } = this.props;
  //   dispatch({ type: ACTION_ADD_VIEWED_PRODUCT, productId: id });
  // }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    const { loading, product } = data;
    if (loading === false) {
      const { subProducts } = product;
      const { subProductId } = nextProps.product;
      const subProductIds = subProducts.map(sp => sp.id);
      const subProductColor = product.images[0].id;
      if (subProductIds.indexOf(subProductId) === -1) {
        this.props.dispatch({
          colorId: subProductColor,
          subProductId: subProductIds[0],
          type: ACTION_SELECT_SUBPRODUCT
        });
      }
    }
  }

  render() {
    const { data, navigation } = this.props;
    const { loading, product } = data;
    const { subProductId, colorId } = this.props.product;

    if (loading === true || subProductId === null) {
      return <Loading />;
    }

    const { brand, images, subProducts } = product;
    const image = images[0];
    const activeSubProduct = getActiveSubProduct(subProducts, subProductId);
    const { price, oldPrice } = activeSubProduct;

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.productContainer}
          // showsHorizontalScrollIndicator= {true}
          // alwaysBounceHorizontal={true}
          // alwaysBounceVe={true}
          // scrollEnabled={true}
        >
          <Images navigation={navigation} images={images} />
          <View style={styles.productContent}>
            <Flex
              justify="around"
              direction="column"
              style={styles.productMainScreen}
            >
              <Text style={styles.infoTitle}>
                {product.name} {brand.name} {"\n"} {activeSubProduct.article}
              </Text>
            </Flex>
            <Hr />
            <ProductInfo
              dataProduct={product}
              activeSubProduct={activeSubProduct}
            />
          </View>
        </ScrollView>
        <ProductBuy price={price} oldPrice={oldPrice} />
      </View>
    );
  }
}

const mapStateToProps: any = state => ({
  product: state.product
});

export default compose<any, any, any>(
  connect<IConnectedProductProps, {}, IProductProps>(mapStateToProps),
  graphql(gql(PRODUCT_QUERY), options)
)(Product as any);
