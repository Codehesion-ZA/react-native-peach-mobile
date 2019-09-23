package za.co.codehesion.peachmobile;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.oppwa.mobile.connect.exception.PaymentError;
import com.oppwa.mobile.connect.exception.PaymentException;
import com.oppwa.mobile.connect.payment.BrandsValidation;
import com.oppwa.mobile.connect.payment.CheckoutInfo;
import com.oppwa.mobile.connect.payment.ImagesRequest;
import com.oppwa.mobile.connect.payment.PaymentParams;
import com.oppwa.mobile.connect.payment.card.CardPaymentParams;
import com.oppwa.mobile.connect.provider.Connect.ProviderMode;
import com.oppwa.mobile.connect.provider.ITransactionListener;
import com.oppwa.mobile.connect.provider.Transaction;
import com.oppwa.mobile.connect.provider.TransactionType;
import com.oppwa.mobile.connect.service.ConnectService;
import com.oppwa.mobile.connect.service.IProviderBinder;

public class PeachMobileModule extends ReactContextBaseJavaModule implements ServiceConnection, ITransactionListener, ActivityEventListener {

    private final ReactApplicationContext reactContext;
    private String urlScheme = "";
    private Promise transactionListenerPromise;
    private Transaction transaction;

    private IProviderBinder binder;

    public PeachMobileModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(PeachMobileModule.this);
        Intent intent = new Intent(reactContext, ConnectService.class);


        reactContext.bindService(intent, this, Context.BIND_AUTO_CREATE);
        reactContext.startService(intent);
    }


    @Override
    public String getName() {
        return "PeachMobile";
    }

    @Override
    public void onServiceConnected(ComponentName componentName, IBinder service) {
        binder = (IProviderBinder) service;
    }

    @Override
    public void onServiceDisconnected(ComponentName componentName) {
        binder = null;
    }

    @ReactMethod
    public void initPaymentProvider(String mode) {

        if (binder != null) {
            try {
                if (mode.equals("live")) {
                    binder.initializeProvider(ProviderMode.LIVE);
                    Log.i("Provider Initialized", "Initialized provider in Live mode.");
                } else {
                    binder.initializeProvider(ProviderMode.TEST);
                    Log.i("Provider Initialized", "Initialized provider in Test mode.");
                }
                binder.addTransactionListener(PeachMobileModule.this);
            } catch (PaymentException error) {
                Log.e("PaymentException", "Failed to initialize payment provider");
            }
        } else {
            Log.e("PaymentException", "Failed to initialize payment provider. Binder is undefined");
        }
    }

    @ReactMethod
    public void setUrlScheme(String urlScheme) {
        this.urlScheme = urlScheme;
    }

    @ReactMethod
    public void createTransaction(String checkoutID, String paymentBrand, String cardHolder, String cardNumber, String cardExpiryMonth, String cardExpiryYear, String cardCVV, Promise promise) {
        if (this.urlScheme.equals("")) {
            promise.reject("", "ShopperResultURL is nil. This probably means you forgot to set it.", new Error("ShopperResultURL is nil"));
            return;
        }

        try {
            createOPPTransaction(checkoutID, paymentBrand, cardHolder, cardNumber, cardExpiryMonth, cardExpiryYear, cardCVV);
            WritableMap map = Arguments.createMap();

            map.putString("checkoutID", checkoutID);
            map.putString("paymentBrand", paymentBrand);
            map.putString("cardHolder", cardHolder);
            map.putString("cardNumber", cardNumber);
            map.putString("cardExpiryMonth", cardExpiryMonth);
            map.putString("cardExpiryYear", cardExpiryYear);
            map.putString("cardCVV", cardCVV);

            promise.resolve(map);

        } catch (PaymentException error) {
            promise.reject(error.getError().getErrorCode().toString(), error.getLocalizedMessage(), error);
        }
    }

    @ReactMethod
    public void submitTransaction(ReadableMap transactionMap, Promise promise) {
        if (binder == null) {
            promise.reject("", "Provider not set. This probably means you forgot to initialize the provider.", new Error("Provider not set"));
            return;
        }
        try {
            Transaction transaction = createOPPTransaction(
                    transactionMap.getString("checkoutID"),
                    transactionMap.getString("paymentBrand"),
                    transactionMap.getString("cardHolder"),
                    transactionMap.getString("cardNumber"),
                    transactionMap.getString("cardExpiryMonth"),
                    transactionMap.getString("cardExpiryYear"),
                    transactionMap.getString("cardCVV")
            );
            transactionListenerPromise = promise;
            binder.submitTransaction(transaction);
        } catch (PaymentException error) {
            promise.reject(error.getError().getErrorCode().toString(), error.getLocalizedMessage(), error);
        }

    }

    @ReactMethod
    public void getResourcePath(Promise promise) {
        if (this.transaction.getPaymentParams().getCheckoutId() == null) {
            promise.reject("", "Checkout ID is invalid", new Error("Checkout ID is invalid"));
        }

        if (this.binder == null) {
            promise.reject("", "Provider not set. This probably means you forgot to initialize the provider.", new Error("Provider not set."));
        }

        try {
            this.binder.requestCheckoutInfo(this.transaction.getPaymentParams().getCheckoutId());
            transactionListenerPromise = promise;
        } catch (PaymentException error) {
            promise.reject(error.getError().getErrorCode().toString(), error.getLocalizedMessage(), error);
        }

    }


    private Transaction createOPPTransaction(String checkoutID, String paymentBrand, String cardHolder, String cardNumber, String cardExpiryMonth, String cardExpiryYear, String cardCVV) throws PaymentException {
        PaymentParams paymentParams = new CardPaymentParams(
                checkoutID,
                paymentBrand,
                cardNumber,
                cardHolder,
                cardExpiryMonth,
                cardExpiryYear,
                cardCVV
        );
        paymentParams.setShopperResultUrl(this.urlScheme + "://result");

        return new Transaction(paymentParams);
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();

        reactContext.unbindService(this);
        reactContext.stopService(new Intent(this.reactContext, ConnectService.class));
    }

    @Override
    public void brandsValidationRequestSucceeded(BrandsValidation brandsValidation) {}

    @Override
    public void brandsValidationRequestFailed(PaymentError paymentError) {}

    @Override
    public void imagesRequestSucceeded(ImagesRequest imagesRequest) {}

    @Override
    public void imagesRequestFailed() {}

    @Override
    public void paymentConfigRequestSucceeded(CheckoutInfo checkoutInfo) {
        transactionListenerPromise.resolve(checkoutInfo.getResourcePath());
    }

    @Override
    public void paymentConfigRequestFailed(PaymentError paymentError) {
        transactionListenerPromise.reject(paymentError.getErrorCode().toString(), paymentError.getErrorMessage(), new Error(paymentError.getErrorInfo()));
    }

    @Override
    public void transactionCompleted(Transaction transaction) {
        this.transaction = transaction;
        WritableMap map = Arguments.createMap();
        if (transaction.getTransactionType() == TransactionType.SYNC) {
            map.putString("transactionType", "synchronous");
        } else if (transaction.getTransactionType() == TransactionType.ASYNC) {
            map.putString("transactionType", "asynchronous");
            map.putString("redirectUrl", transaction.getRedirectUrl());
        } else {
            transactionListenerPromise.reject("", "Invalid transaction.", new Error("Invalid Transaction"));
            return;
        }
        transactionListenerPromise.resolve(map);
    }

    @Override
    public void transactionFailed(Transaction transaction, PaymentError paymentError) {
        transactionListenerPromise.reject(paymentError.getErrorCode().toString(), paymentError.getErrorMessage(), new Error(paymentError.getErrorInfo()));
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {}

    private void sendEvent(String eventName) {
        this.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, null);
    }

    @Override
    public void onNewIntent(Intent intent) {
        Log.d("Peach Mobile Module 2", intent.getScheme());
        if (intent.getScheme().equals(this.urlScheme)) {
            sendEvent("asynchronousPaymentCallback");
        }
    }
}
