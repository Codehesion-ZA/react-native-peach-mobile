# Peach Payments Mobile for React Native

<span class="badge-npmdownloads"><a href="https://npmjs.org/package/react-native-peach-mobile" title="View this project on NPM"><img alt="npm" src="https://img.shields.io/npm/v/react-native-peach-mobile" alt="NPM downloads"></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/react-native-peach-mobile" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/react-native-peach-mobile" alt="NPM downloads" /></a></span>

Peach Payments Mobile component or React Native (iOS and Android)
[Peach Payments](https://www.peachpayments.com/#/home) is a South African payment gateway. It currently powers businesses in South Africa and Mauritius and will soon be launching services in Kenya, Nigeria and more countries in Africa.

<p align="center">
<img src="/docs/example.gif" height="500" />
</p>

This React Native component bridges the Peach Payments Mobile SDk, specifically the ["SDK & Your Own UI"](https://peachpayments.docs.oppwa.com/tutorials/mobile-sdk/custom-ui/integration) functions. Before using this component, first read through Peach Payment's documentation, especially their ["Set Up Your Server""](https://peachpayments.docs.oppwa.com/tutorials/mobile-sdk/integration/server) doc. You will need to expose two APIs on your backend for your app to communicate with.

## Setup

### Installation

#### Installing (React Native >= 0.60.0)

Install `react-native-peach-mobile` (latest):

```
yarn add react-native-peach-mobile react-native-webview --save
```

or

```
npm install react-native-peach-mobile react-native-webview --save
```

Go to your ios folder and run:

```
pod install
```

#### Installing (React Native == 0.59.x)

Install `react-native-peach-mobile` (latest):

```
yarn add react-native-peach-mobile --save
```

or

```
npm install react-native-peach-mobile
```

Use `react-native link` to add the package to your project:

```
react-native link react-native-peach-mobile
```

### Integrating into Your App

The following things need to be setup for the package to work. If you get stuck, check the Example App's files. 

#### iOS

Add the following to `AppDelegate.m`, replacing "com.example.app.payments" on line two with your app's bundle ID plus `.payments`:
```objective-c
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  if ([url.scheme localizedCaseInsensitiveCompare:@"com.example.app.payments"] == NSOrderedSame) {
    [NSNotificationCenter.defaultCenter postNotificationName:@"AsyncPaymentCompletedNotificationKey"  object:nil];
    return true;
  }
  return false;
}
```

Add the following to `Info.plist` again, replacing "com.example.app.payments" on line three with your app's bundle ID plus `.payments`:
```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>com.example.app.payments</string>
</array>
```

The iOS 
 is written in Swift, it is therefore necessary to create a Swift Bridging Header (If you don't have one already). 

Add a new file to Xcode (File > New > File), then select “Swift File”. Name your file `RNPlaceholder`. You should get an alert box asking "Would you like  configure an Objective-C bridging header?". Select 'Create Bridging Header'.

![](/docs/alert.png "Would you like  configure an Objective-C bridging header?")
#### Android

Add the following to your app's `MainActivity.java`:
```Java
@Override
public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
}
```

Add the following to `AndroidManifest.xml` inside the activity tag, replacing "com.example.app.payments" on line two with your app's package name plus `.payments`:
```xml
<intent-filter>
      <data android:scheme="com.example.app.payments"/>

      <action android:name="android.intent.action.VIEW"/>

      <category android:name="android.intent.category.DEFAULT"/>
      <category android:name="android.intent.category.BROWSABLE"/>
</intent-filter>
```

## Usage

_A complete working example can be found in the /ExampleApp directory._

Since this package bridges the functionality of the Peach Payments Mobile SDK's custom UI functionality it follows the same four steps for accepting payments:
1. Preparing checkout (configure with amount, currency and other information),
2. Collecting shopper payment details,
3. Creating and submitting transaction,
4. Requesting payment result.

Follow the next few steps to start accepting payments in your app:

1. Import react-native-peach-mobile:
```javascript
import PeachMobile from 'react-native-peach-mobile';
```

2. Add the PeachMobile component inside your render function and create a ref to the component:
```jsx harmony
render() {
    const { cardHolder, cardNumber, cardExpiryYear, cardExpiryMonth, cardCVV } = this.state;
    return (
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
    );
}

setPeachMobileRef(ref) {
    this.peachMobile = ref;
}
```

The URL Scheme should be the same as you set when integrating the package into Your app, i.e your bundle ID plus `.payments`.
For all props that can be passed to the component and their descriptions see Available Props

(It does not really matter where the PeachMobile component is placed within your JSX. The PeachMobile component renders a modal containing the 3D secure webview, the modal will be displayed above the current screen.)

3. Get checkout ID:
```javascript
let checkoutIdResponse = await PeachMobile.getCheckoutId(
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
              );
this.setState({checkoutID: checkoutIdResponse});
```

4. Submit the transaction:
```javascript
await this.peachMobile.submitTransaction();
```

5. Get the payment status:
```javascript
let response = await PeachMobile.getPaymentStatus(
        transaction.url,
        null,
        {entityId: '8a8294174e735d0c014e78cf26461790'},
        { Authorization: `Bearer ${authToken}` }
    );

const successCodesPattern = /^(000\.000\.|000\.100\.1|000\.[36])/;
if (response.data.result.code && successCodesPattern.test(response.data.result.code)) {
    Alert.alert('Transaction Successful', 'The transaction was successful.');
} else {
    Alert.alert('Transaction Unsuccessful', `Transaction was unsuccessful. ${response.data.result.description}`);
}
```

## Available Props

| Name                | Type             | Default                        | Description                                                                                                                                |
| ------------------- | ---------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| mode                | string           | 'test'                         | The mode SDK payment provider should operate in. Can be `test` or `live`.                                                                  |
| urlScheme           | string           | **Required**                   | The scheme that is used when redirecting after 3D secure has completed. Should be the bundle ID of the app play `.payments`                |
| modalHeader         | node             | <Default3DSecureModal />       | The element that will be rendered above the webview inside the modal.                                                                      |
| modalFooter         | node             | null                           | The element that will be rendered below the webview inside the modal.                                                                      |
| webviewStyle        | object           | null                           | The styles for the webview. This prop is directly passed to the `WebView` component's style prop.                                          |
| modalStyle          | object           | null                           | The styles for the modal. This prop is directly passed to the `Modal` component's style prop.                                              |
| modalContainerStyle | object           | null                           | The styles for the view that wraps the modals content, including the modalHeader, webview and modalFooter.                                 |
| checkoutID          | string           | <b>Conditional*</b>            | The checkout ID received from your server.                                                                                                 |
| paymentBrand        | string           | null                           | The card brand. E.g Visa, MasterCard, etc.                                                                                                 |
| cardHolder          | string           | <b>Conditional*</b>            | The name of the card holder appearing on the card.                                                                                         |
| cardNumber          | string           | <b>Conditional*</b>            | The card number appearing on the card.                                                                                                     |
| cardExpiryMonth     | string           | <b>Conditional*</b>            | The card expiry month.                                                                                                                     |
| cardExpiryYear      | string           | <b>Conditional*</b>            | The card expiry year.                                                                                                                      |
| cardCVV             | string           | <b>Conditional*</b>            | The three or four digit CVV code of the card.                                                                                              |

*All the fields marked Conditional\* are not required if you pass the `submitTransaction()` function a transaction object.   

## Available Methods

#### `getCheckoutId()`
```javascript
static getCheckoutId(url: string, amount: string, currency: string, paymentType: string, otherParams: object, requestHeaders: object, testMode: string)
```

Request the checkout ID from your server. You don't need to use this function. You can write your own function for making the request for the checkout ID from your server and still normally pass it to the `PeachMobile` component. Returns a axios request promise.

##### Parameters:

| Name           | Type   | Required | Description                                                                                                                                                                                       |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url            | string | Yes      | The url the request for the checkout ID should be made too.                                                                                                                                       |
| amount         | string | Yes      | The amount that should be charged to the users card.                                                                                                                                              |
| currency       | string | Yes      | The currency the amount should be charged in.                                                                                                                                                     |
| paymentType    | string | Yes      | The payment type for the request. Check [Peach Payments API Reference](https://peachpayments.docs.oppwa.com/reference/parameters) for all payment types and descriptions.                         |
| otherParams    | object | No       | Any other params that needs to be passed with the call.                                                                                                                                           |
| requestHeaders | object | No       | Request headers for the network call.                                                                                                                                                             |
| testMode       | string | No       | The testMode for the checkout. Can be 'EXTERNAL' or 'INTERNAL'. Check [Peach Payments API Reference](https://peachpayments.docs.oppwa.com/reference/parameters) for more information on testMode. |

#### `createTransaction()`
```javascript
static createTransaction(checkoutID: string, paymentBrand: string, cardHolder: string, cardNumber: string, cardExpiryMonth: string, cardExpiryYear: string, cardCVV: string)
```

Validate the card parameters and create a transaction object. Returns a promise that when resolves will return a transaction object. You can use this function to create a transaction that can be passed to the `submitTransaction` function. It is then not necessary too pass the card details as props to the component.   

##### Parameters:

| Name            | Type   | Required | Description                                        |
| --------------- | ------ | -------- | ---------------------------------------------------|
| checkoutID      | string | Yes      | The checkout ID received from your server.         |
| paymentBrand    | string | No       | The card brand. E.g Visa, MasterCard, etc.         |
| cardHolder      | string | Yes      | The name of the card holder appearing on the card. |
| cardNumber      | string | Yes      | The card number appearing on the card.             |
| cardExpiryMonth | string | Yes      | The card expiry month.                             |
| cardExpiryYear  | string | Yes      | The card expiry year.                              |
| cardCVV         | string | Yes      | The three or four digit CVV code of the card.      |

#### `submitTransaction()`
```javascript
submitTransaction(transaction: TransactionObject)
```

Submit the transaction to peach payments. Returns a promise that will resolve to true if the transaction was successfully submitted or will reject if there was an error. 
A 3D secure modal will automatically open if 3D secure is required, once the user has submitted the 3D secure form the modal will again automatically close and the promise will resolve.

##### Parameters:

| Name            | Type              | Required | Description                                                                                                                             |
| --------------- | ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------|
| transaction     | TransactionObject | No       | If you have not passed any card props to the component you can pass a transaction object created by the `createTransaction()` function. |
 
#### `getResourcePath()`
```javascript
static getResourcePath()
```

Get the resource path after the transaction has been submitted. Will return a promise that resolves to the resource path string. Useful when you are using your own function to check the transaction status and require the resource path.

### `getPaymentStatus()`
```javascript
static getPaymentStatus(url: string, resourcePath: string, otherParams: object, requestHeaders: object)
```

Get the status of the payment after the transaction has been submitted.  Will return a axios request promise. You don't need to use this function. You can write your own function for requesting the transaction status from your server. 

##### Paramaters:

| Name           | Type   | Required | Description                                                                                                                                       |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| url            | string | Yes      | The url the request for the transaction status should be made too.                                                                                |
| resourcePath   | string | No       | The resource path requested from the SDK. If this is not passed, the function will fetch it from the SDK using the `getPaymentStatus()` function. |
| otherParams    | object | No       | Any other params that needs to be passed with the call.                                                                                           |
| requestHeaders | object | No       | Request headers for the network call.                                                                                                             |

## Available Modal Props
Take a look at [react-native-modal](https://github.com/react-native-community/react-native-modal) to see all the available props to customise the 3D secure modal. All the props of the Modal are directly available through the `PeachMobile` component except the `isVisible` prop. The `isVisible` prop is controlled by the package to show and hide the 3D secure modal automatically.

##### Pull requests, feedback and suggestions are welcome! 