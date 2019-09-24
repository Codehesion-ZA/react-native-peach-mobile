# Peach Payments Mobile for React Native

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

## Available Modal Props
Take a look at [react-native-modal](https://github.com/react-native-community/react-native-modal) to see all the available props to customise the 3D secure modal. All the props of the Modal are directly available through the `PeachMobile` component except the `isVisible` prop. The `isVisible` prop is controlled by the package to show and hide the 3D secure modal automatically.

##### Pull requests, feedback and suggestions are welcome! 