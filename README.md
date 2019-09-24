# Peach Payments Mobile for React Native

Peach Payments Mobile component or React Native (iOS and Android)

[Peach Payments](https://www.peachpayments.com/#/home) is a South African payment gateway. It currently powers businesses in South Africa and Mauritius and will soon be launching services in Kenya, Nigeria and more countries in Africa.

This React Native component bridges the Peach Payments Mobile SDk, specifically the ["SDK & Your Own UI"](https://peachpayments.docs.oppwa.com/tutorials/mobile-sdk/custom-ui/integration) functions. Before using this component, first read through Peach Payment's documentation, especially their ["Set Up Your Server""](https://peachpayments.docs.oppwa.com/tutorials/mobile-sdk/integration/server) doc. You will need to expose two APIs on your backend for your app to communicate with.

## Getting started

### Installation

#### Installing (React Native >= 0.60.0)

Install `react-native-peach-mobile` (latest):

```
yarn add react-native-peach-mobile --save
```

or

```
npm install react-native-peach-mobile
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

Use `react-native link` to add the library to your project:

```
react-native link react-native-peach-mobile
```

### Integrating into Your App

#### iOS

Add the following to `AppDelegate.m` replacing "com.example.app.payments" on line two with your app's bundle ID plus `.payments`:
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

The iOS library is written in Swift, it is therefore necessary to create a Swift Bridging Header (If you don't have one already). 

Add a new file to Xcode (File > New > File), then select “Swift File”. Name your file `RNPlaceholder`. You should get an alert box asking "Would you like  configure an Objective-C bridging header?". Select 'Create Bridging Header'.

![](https://github.com/Codehesion-ZA/react-native-peach-mobile/blob/master/docs/alert.png "Would you like  configure an Objective-C bridging header?")
#### Android



## Usage
```javascript
import PeachMobile from 'react-native-peach-mobile';

// TODO: What to do with the module?
PeachMobile;
```
