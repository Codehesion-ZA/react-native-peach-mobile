import { NativeModules } from 'react-native';
import _ from 'lodash';

const { PeachMobile } = NativeModules;

function initPaymentProvider(mode) {
    PeachMobile.initPaymnetProvider(mode);
}

function setUrlScheme(urlScheme) {
    PeachMobile.setUrlScheme(urlScheme);
}

function getCheckoutId(amount, currency, paymentType, testMode) {
    let parameters = {
        amount: currency.toString(),
        currency,
        paymentType,
        testMode
    };

}

export default {
    initPaymentProvider,
    setUrlScheme,
    getCheckoutId
};