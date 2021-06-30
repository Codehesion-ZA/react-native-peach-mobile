#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(PeachMobile, RCTEventEmitter)

RCT_EXTERN_METHOD(initPaymentProvider:(NSString *)mode)
RCT_EXTERN_METHOD(setUrlScheme:(NSString *)urlScheme)
RCT_EXTERN_METHOD(createTransaction:(NSString *)checkoutID paymentBrand:(NSString *)paymentBrand cardHolder:(NSString *)cardHolder cardNumber:(NSString *)cardNumber cardExpiryMonth:(NSString *)cardExpiryMonth cardExpiryYear:(NSString *)cardExpiryYear cardCVV:(NSString *)cardCVV resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(createTransactionWithToken:(NSString *)checkoutID paymentBrand:(NSString *)paymentBrand tokenID:(NSString *)tokenID cardCVV:(NSString *)cardCVV resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(submitTransaction:
                  (NSDictionary *)transactionDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(submitRegistration:
                  (NSDictionary *)transactionDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getResourcePath:
                  (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
