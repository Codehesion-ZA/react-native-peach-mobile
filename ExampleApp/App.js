import React, {Component, Fragment} from 'react';
import {
  SafeAreaView,
  StatusBar,
    View,
    StyleSheet,
    Alert
} from 'react-native';
import PeachMobile from 'react-native-peach-mobile';
import { Input, Button, Text } from 'react-native-elements';

const transaction =  {
    amount: 234.34,
    currency: 'ZAR',
    paymentType: 'DB',
    testMode: 'INTERNAL',
    url: 'https://test.oppwa.com'
};
const authToken = 'OGE4Mjk0MTc0ZTczNWQwYzAxNGU3OGNmMjY2YjE3OTR8cXl5ZkhDTjgzZQ==';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cardHolder: "John Doe",
            cardNumber: "4711100000000000",
            cardExpiryYear: "2021",
            cardExpiryMonth: "12",
            cardCVV: "123",
            cardBrand: "VISA",
            checkoutID: "",
            loading: false,
            renderCardInput: false
        };

        this.payNowButtonPress = this.payNowButtonPress.bind(this);
        this.checkoutButtonPress = this.checkoutButtonPress.bind(this);
        this.setCardHolder = this.setCardHolder.bind(this);
        this.setCardNumber = this.setCardNumber.bind(this);
        this.setCardExpiryYear = this.setCardExpiryYear.bind(this);
        this.setCardExpiryMonth = this.setCardExpiryMonth.bind(this);
        this.setCardCVV = this.setCardCVV.bind(this);
        this.setPeachMobileRef = this.setPeachMobileRef.bind(this);
    }

    render() {
        const { cardHolder, cardNumber, cardExpiryYear, cardExpiryMonth, cardCVV, checkoutID } = this.state;

        return (
            <Fragment>
                  <StatusBar barStyle="dark-content"/>
                  <SafeAreaView>
                      <PeachMobile
                          mode="test"
                          urlScheme="com.example.app.payments"
                          cardHolder={cardHolder}
                          cardNumber={cardNumber}
                          cardExpiryYear={cardExpiryYear}
                          cardExpiryMonth={cardExpiryMonth}
                          cardCVV={cardCVV}
                          checkoutID={checkoutID}
                          ref={this.setPeachMobileRef}
                      />
                      {this.renderTransactionDetails()}
                      {this.renderCardInput()}
                  </SafeAreaView>
              </Fragment>
        );
    }

    renderTransactionDetails() {
        const { renderCardInput } = this.state;
        if (renderCardInput) {
            return null;
        }

        return (
            <Fragment>
                <Text style={styles.headerText}>Transaction Info</Text>
                <View style={styles.transactionInfoItem}><Text style={styles.transactionInfoLabel}>Amount:</Text><Text>{transaction.amount}</Text></View>
                <View style={styles.transactionInfoItem}><Text style={styles.transactionInfoLabel}>Currency:</Text><Text>{transaction.currency}</Text></View>
                <View style={styles.transactionInfoItem}><Text style={styles.transactionInfoLabel}>Payment Type:</Text><Text>{transaction.paymentType}</Text></View>
                <View style={styles.transactionInfoItem}><Text style={styles.transactionInfoLabel}>Test Mode:</Text><Text>{transaction.testMode}</Text></View>
                <Button
                    title="Checkout"
                    containerStyle={styles.buttonContainerStyle}
                    buttonStyle={styles.buttonStyle}
                    onPress={this.checkoutButtonPress}
                    loading={this.state.loading}
                />
            </Fragment>
        );
    }

    renderCardInput() {
        const { cardHolder, cardNumber, cardExpiryYear, cardExpiryMonth, cardCVV, renderCardInput } = this.state;
        if (!renderCardInput) {
            return null;
        }

        return (
            <Fragment>
                <Text style={styles.headerText}>Card Details</Text>
                <Input
                    label="Name on card"
                    placeholder="John Doe"
                    labelStyle={styles.labelStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.containerStyle}
                    inputStyle={styles.inputStyle}
                    onChangeText={this.setCardHolder}
                    value={cardHolder}
                />
                <Input
                    label="Card number"
                    placeholder="4200000000000000"
                    labelStyle={styles.labelStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.containerStyle}
                    inputStyle={styles.inputStyle}
                    onChangeText={this.setCardNumber}
                    value={cardNumber}
                />
                <View style={styles.viewRow}>
                    <Input
                        label="Expiry Date"
                        placeholder="MM"
                        labelStyle={styles.labelStyle}
                        inputContainerStyle={styles.inputContainerStyle}
                        containerStyle={[styles.containerStyle, styles.rowContainerStyle]}
                        inputStyle={styles.inputStyle}
                        onChangeText={this.setCardExpiryMonth}
                        value={cardExpiryMonth}
                    />
                    <Input
                        label=""
                        placeholder="YY"
                        labelStyle={styles.labelStyle}
                        inputContainerStyle={styles.inputContainerStyle}
                        containerStyle={[styles.containerStyle, styles.rowContainerStyle, styles.emptyLabel]}
                        inputStyle={styles.inputStyle}
                        onChangeText={this.setCardExpiryYear}
                        value={cardExpiryYear}
                    />
                    <Input
                        label="CVV"
                        placeholder="123"
                        labelStyle={styles.labelStyle}
                        inputContainerStyle={styles.inputContainerStyle}
                        containerStyle={[styles.containerStyle, styles.rowContainerStyle]}
                        inputStyle={styles.inputStyle}
                        onChangeText={this.setCardCVV}
                        value={cardCVV}
                    />
                </View>
                <Button
                    title="Pay now"
                    containerStyle={styles.buttonContainerStyle}
                    buttonStyle={styles.buttonStyle}
                    onPress={this.payNowButtonPress}
                    loading={this.state.loading}
                />
            </Fragment>
        );
    }

    setPeachMobileRef(ref) {
        this.peachMobile = ref;
    }

    checkoutButtonPress() {
        this.setState({loading: true});
        PeachMobile.getCheckoutId(
            transaction.url + '/v1/checkouts',
            transaction.amount,
            transaction.currency,
            transaction.paymentType,
            {
                entityId: '8a8294174e735d0c014e78cf26461790',
                notificationUrl: 'https://en962llz1kivw.x.pipedream.net'
            },
            { Authorization: `Bearer ${authToken}` },
            transaction.testMode
        ).then(response => {
            this.setState({checkoutID: response.data.id, renderCardInput: true, loading: false});
        }).catch( error => {
            this.setState({loading: false});
            console.warn(error.response);
        });
    }

    payNowButtonPress() {
        this.setState({loading: true});
        this.peachMobile.submitTransaction()
        .then(() => {
            return PeachMobile.getPaymentStatus(
                transaction.url,
                null,
                {entityId: '8a8294174e735d0c014e78cf26461790'},
                { Authorization: `Bearer ${authToken}` }
            ).then(response => {
                const successPattern = /^(000\.000\.|000\.100\.1|000\.[36])/;
                if (response.data.result.code && successPattern.test(response.data.result.code)) {
                    Alert.alert('Transaction Successful', 'The transaction was successful.');
                    this.setState({loading: false, renderCardInput: false});
                } else {
                    setTimeout(() => Alert.alert('Transaction Unsuccessful', `Transaction was unsuccessful. ${response.data.result.description}`), 1000);
                    console.warn(`Transaction failed. ${response.data.result.description}`, response.data);
                    this.setState({loading: false, renderCardInput: false});
                }
            });
        })
        .catch(error => {
            this.setState({loading: false, renderCardInput: false});
            setTimeout(() => Alert.alert('Transaction Unsuccessful', `Transaction was unsuccessful. ${error.message}`), 1000);
            console.warn(`Transaction failed. ${error.message}`, error.response.data);
        });
    }

    setCardHolder(cardHolder) {
        this.setState({cardHolder});
    }

    setCardNumber(cardNumber) {
        this.setState({cardNumber});
    }

    setCardExpiryYear(cardExpiryYear) {
        this.setState({cardExpiryYear});
    }

    setCardExpiryMonth(cardExpiryMonth) {
        this.setState({cardExpiryMonth});
    }

    setCardCVV(cardCVV) {
        this.setState({cardCVV});
    }
}

const styles = StyleSheet.create({
    inputContainerStyle: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#c7c7c7',
        height: 30
    },
    inputStyle: {
        marginLeft: 5
    },
    containerStyle: {
        marginTop: 15
    },
    labelStyle: {
        marginLeft: 5,
        color: '#262626',
        fontWeight: 'normal',
        fontSize: 15,
        paddingBottom: 5
    },
    viewRow: {
        flexDirection: 'row'
    },
    rowContainerStyle: {
        flex: 1/3
    },
    buttonContainerStyle: {
        margin: 8,
        marginTop: 20
    },
    buttonStyle: {
        borderRadius: 10,
        height: 50
    },
    emptyLabel: {
        paddingTop: 5
    },
    transactionInfoLabel: {
        fontWeight: 'bold',
        marginLeft: 10,
        paddingRight: 10
    },
    transactionInfoItem: {
        flexDirection: 'row',
        paddingTop: 5,
        marginLeft: 12
    },
    headerText: {
        fontSize: 25,
        fontWeight: 'bold',
        paddingTop: 20,
        marginLeft: 8
    }
});
