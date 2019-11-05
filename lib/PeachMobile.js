import React, {Component} from 'react';
import {NativeModules, NativeEventEmitter, View, Text, StyleSheet, SafeAreaView} from 'react-native';
import { stringify } from 'query-string';
import PropTypes from 'prop-types';
import axios from 'axios';
import _ from 'lodash';
import Modal from "react-native-modal";
import { WebView } from 'react-native-webview';

const { PeachMobile } = NativeModules;
const TransactionTypes = {
    SYNCHRONOUS: 'synchronous',
    ASYNCHRONOUS: 'asynchronous'
};
const TransactingModes = {
    TEST: 'test',
    LIVE: 'live'
};
const PeachMobileEvents = new NativeEventEmitter(NativeModules.PeachMobile);

PeachMobileEvents.addListener(
    "asynchronousPaymentCallback",
    () => {asynchronousPaymentCallbackCalled = true;}
);

let asynchronousPaymentCallbackCalled = false;

export default class PeachMobileComponent extends Component {
    static propTypes = {
        mode: PropTypes.oneOf([TransactingModes.TEST, TransactingModes.LIVE]).isRequired,
        urlScheme: PropTypes.string.isRequired,
        checkoutID: PropTypes.string,
        paymentBrand: PropTypes.string,
        cardHolder: PropTypes.string,
        cardNumber: PropTypes.string,
        cardExpiryMonth: PropTypes.string,
        cardExpiryYear: PropTypes.string,
        cardCVV: PropTypes.string,
        modalHeader: PropTypes.node,
        modalFooter: PropTypes.node,
        webviewStyle: PropTypes.any,
        modalStyle: PropTypes.any,
        modalContainerStyle: PropTypes.any,
        animationIn: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        animationInTiming: PropTypes.number,
        animationOut: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        animationOutTiming: PropTypes.number,
        avoidKeyboard: PropTypes.bool,
        coverScreen: PropTypes.bool,
        hasBackdrop: PropTypes.bool,
        backdropColor: PropTypes.string,
        backdropOpacity: PropTypes.number,
        backdropTransitionInTiming: PropTypes.number,
        backdropTransitionOutTiming: PropTypes.number,
        customBackdrop: PropTypes.node,
        deviceHeight: PropTypes.number,
        deviceWidth: PropTypes.number,
        hideModalContentWhileAnimating: PropTypes.bool,
        propagateSwipe: PropTypes.bool,
        onModalShow: PropTypes.func,
        onModalWillShow: PropTypes.func,
        onModalHide: PropTypes.func,
        onModalWillHide: PropTypes.func,
        onBackButtonPress: PropTypes.func,
        onBackdropPress: PropTypes.func,
        onSwipeStart: PropTypes.func,
        onSwipeMove: PropTypes.func,
        onSwipeComplete: PropTypes.func,
        onSwipeCancel: PropTypes.func,
        swipeThreshold: PropTypes.number,
        swipeDirection: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.oneOf(['up', 'down', 'left', 'right'])),
            PropTypes.oneOf(['up', 'down', 'left', 'right']),
        ]),
        useNativeDriver: PropTypes.bool,
        scrollTo: PropTypes.func,
        scrollOffset: PropTypes.number,
        scrollOffsetMax: PropTypes.number,
        scrollHorizontal: PropTypes.bool,
        supportedOrientations: PropTypes.arrayOf(
            PropTypes.oneOf([
                'portrait',
                'portrait-upside-down',
                'landscape',
                'landscape-left',
                'landscape-right',
            ])
        )
    };

    static defaultProps = {
        avoidKeyboard: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            transactionRedirectUrl: null,
            showModal: false
        };
    }

    componentDidMount() {
        const {mode, urlScheme} = this.props;
        PeachMobile.initPaymentProvider(mode);
        PeachMobile.setUrlScheme(urlScheme);
    }

    render() {
        const {transactionRedirectUrl, showModal} = this.state;
        const {
            modalHeader,
            modalFooter,
            webviewStyle,
            modalStyle,
            modalContainerStyle,
            animationIn,
            animationInTiming,
            animationOut,
            animationOutTiming,
            avoidKeyboard,
            coverScreen,
            hasBackdrop,
            backdropColor,
            backdropOpacity,
            backdropTransitionInTiming,
            backdropTransitionOutTiming,
            customBackdrop,
            deviceHeight,
            deviceWidth,
            hideModalContentWhileAnimating,
            propagateSwipe,
            onModalShow,
            onModalWillShow,
            onModalHide,
            onModalWillHide,
            onBackButtonPress,
            onBackdropPress,
            onSwipeStart,
            onSwipeMove,
            onSwipeComplete,
            onSwipeCancel,
            swipeThreshold,
            swipeDirection,
            useNativeDriver,
            scrollTo,
            scrollOffset,
            scrollOffsetMax,
            scrollHorizontal,
            supportedOrientations
        } = this.props;

        return (
            <Modal
                isVisible={!!showModal && !!transactionRedirectUrl}
                animationIn={animationIn}
                animationInTiming={animationInTiming}
                animationOut={animationOut}
                animationOutTiming={animationOutTiming}
                avoidKeyboard={avoidKeyboard}
                coverScreen={coverScreen}
                hasBackdrop={hasBackdrop}
                backdropColor={backdropColor}
                backdropOpacity={backdropOpacity}
                backdropTransitionInTiming={backdropTransitionInTiming}
                backdropTransitionOutTiming={backdropTransitionOutTiming}
                customBackdrop={customBackdrop}
                deviceHeight={deviceHeight}
                deviceWidth={deviceWidth}
                hideModalContentWhileAnimating={hideModalContentWhileAnimating}
                propagateSwipe={propagateSwipe}
                onModalShow={onModalShow}
                onModalWillShow={onModalWillShow}
                onModalHide={onModalHide}
                onModalWillHide={onModalWillHide}
                onBackButtonPress={onBackButtonPress}
                onBackdropPress={onBackdropPress}
                onSwipeStart={onSwipeStart}
                onSwipeMove={onSwipeMove}
                onSwipeComplete={onSwipeComplete}
                onSwipeCancel={onSwipeCancel}
                swipeThreshold={swipeThreshold}
                swipeDirection={swipeDirection}
                useNativeDriver={useNativeDriver}
                style={modalStyle}
                scrollTo={scrollTo}
                scrollOffset={scrollOffset}
                scrollOffsetMax={scrollOffsetMax}
                scrollHorizontal={scrollHorizontal}
                supportedOrientations={supportedOrientations}
            >
                <SafeAreaView style={styles.safeAreaView}>
                    <View style={[styles.modalContainer, modalContainerStyle]}>
                        {modalHeader ? modalHeader : renderDefaultModalHeader()}
                        <WebView
                            source={{ uri: transactionRedirectUrl }}
                            style={[styles.webview, webviewStyle]}
                        />
                        {modalFooter}
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    async submitTransaction(transaction) {
        const {checkoutID, paymentBrand, cardHolder, cardNumber, cardExpiryMonth, cardExpiryYear, cardCVV} = this.props;

        let createdTransaction;
        if (!transaction) {
            await createdTransaction = PeachMobileComponent.createTransaction(checkoutID, paymentBrand, cardHolder, cardNumber, cardExpiryMonth, cardExpiryYear, cardCVV);
        } else {
            createdTransaction = transaction;
        }
        return PeachMobileComponent.submitTransaction(createdTransaction);

    }

    static submitTransaction(transaction) {
        const submitTransactionCompletionHandler = (checkoutTransaction) => {
            if (checkoutTransaction.transactionType === TransactionTypes.SYNCHRONOUS) {
                this.setState({transactionType: TransactionTypes.SYNCHRONOUS});
                return true;
            }
            if (!_.has(checkoutTransaction, 'redirectUrl')) {
                throw Error('Redirect URL is null.');
            }
            this.setState({transactionRedirectUrl: checkoutTransaction.redirectUrl, showModal: true});
            return waitForAsynchronousPaymentCallback(500, 5).then(() => {
                this.setState({showModal: false});
                return true;
            }).catch(error => {
                this.setState({showModal: false});
                throw error
            });
        };

        return submitTransaction(transaction).then(submitTransactionCompletionHandler);
    }

    static createTransaction(checkoutID, paymentBrand, cardHolder, cardNumber, cardExpiryMonth, cardExpiryYear, cardCVV) {
        let tempPaymentBrand = paymentBrand ? paymentBrand : '';
        return PeachMobile.createTransaction(checkoutID, tempPaymentBrand, cardHolder,cardNumber,cardExpiryMonth, cardExpiryYear, cardCVV);
    }

    static createTransactionWithToken(checkoutID, tokenID, paymentBrand, cardCVV) {
        let tempPaymentBrand = paymentBrand ? paymentBrand : '';
        return PeachMobile.createTransactionWithToken(checkoutID, paymentBrand, tokenID, cardCVV);
    }

    static getCheckoutId(url, amount, currency, paymentType, otherParams, requestHeaders, testMode) {
        let parameters = {
            amount: amount.toString(),
            currency,
            paymentType,
            testMode
        };
        parameters = _.merge(parameters, otherParams);
        let parameterString = stringify(parameters);
        return axios.post(url, parameterString, { headers: requestHeaders });
    }

    static getResourcePath() {
        return PeachMobile.getResourcePath();
    }

    static getPaymentStatus(url, resourcePath, otherParams, requestHeaders) {
        if (!resourcePath) {
            return PeachMobile.getResourcePath().then(resourcePath => doGetPaymentStatus(url, resourcePath, otherParams, requestHeaders));
        }
        return doGetPaymentStatus(url, requestHeaders, otherParams, resourcePath)
    }
}

function submitTransaction(transaction) {
    return PeachMobile.submitTransaction(transaction);
}

function doGetPaymentStatus(url, resourcePath, otherParams, requestHeaders) {
    const urlParams = new URLSearchParams(otherParams).toString();
    let urlWithParams = `${url}${resourcePath}?${urlParams}`;
    return axios.get(urlWithParams, { headers: requestHeaders });
}

async function waitForAsynchronousPaymentCallback(msToWait, totalMinutesToWait) {
    const timeOutCount = (1000 * 60 * totalMinutesToWait) / msToWait;
    let count = 0;
    asynchronousPaymentCallbackCalled = false;
    while (!asynchronousPaymentCallbackCalled && count <= timeOutCount) {
        await wait(msToWait);
        count += 1;
    }
    if (!asynchronousPaymentCallbackCalled) {
        throw Error(`3D Secure timed out after ${totalMinutesToWait} minutes.`);
    }
    asynchronousPaymentCallbackCalled = false;
    return true;
}

async function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function renderDefaultModalHeader() {
    return (
        <View style={styles.defaultModalHeaderContainer}>
            <Text>3D Secure</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1
    },
    webview: {
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        flexDirection: 'column',
        flex: 1
    },
    defaultModalHeaderContainer: {
        padding: 10,
        alignItems: 'center'
    }
});