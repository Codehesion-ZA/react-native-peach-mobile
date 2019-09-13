//
//  PeachMobile.swift
//  PeachMobile
//
//  Created by Craig Van Heerden on 2019/09/12.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import SafariServices

let AsyncPaymentCompletedNotificationKey = "AsyncPaymentCompletedNotificationKey"

@objc(PeachMobile)
class PeachMobile: RCTEventEmitter {
    
    var provider: OPPPaymentProvider?
    var transaction: OPPTransaction?
    var safariVC: SFSafariViewController?
    var urlScheme: String?
    
    @objc func initPaymnetProvider(_ mode: String) {
        var oppProviderMode: OPPProviderMode;
        if (mode == "live") {
                oppProviderMode = OPPProviderMode.live
        } else {
            oppProviderMode = OPPProviderMode.test
        }
        self.provider = OPPPaymentProvider.init(mode: oppProviderMode)
    }
    
    @objc func setUrlScheme(_ urlScheme: String) {
        self.urlScheme = urlScheme;
    }
    
    @objc func createTransaction(_ checkoutID: String, paymentBrand: String, cardHolder: String?, cardNumber: String, cardExpiryMonth: String, cardExpiryYear: String, cardCVV: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        if (self.urlScheme == nil) {
            reject("E_PEACH_MOBILE", "ShopperResultURL is nil. This probably means you forgot to set it,", NSError(domain: "", code: 3001, userInfo: nil));
            return;
        }
        
        guard createTransaction(checkoutID: checkoutID, paymentBrand: paymentBrand, cardHolder: cardHolder, cardNumber: cardNumber, cardExpiryMonth: cardExpiryMonth, cardExpiryYear: cardExpiryYear, cardCVV: cardCVV) != nil else {
            reject("E_PEACH_MOBILE" , "Invalid payment params.", NSError(domain: "", code: 3001, userInfo: nil))
            return
        }
        
        resolve([
            "checkoutID": checkoutID,
            "cardHolder": cardHolder,
            "cardNumber": cardNumber,
            "cardExpiryMonth": cardExpiryMonth,
            "cardExpiryYear": cardExpiryYear,
            "cardCVV": cardCVV
            ])
    }
    
    @objc func submitTransaction(_ transactionDict: Dictionary<String, String>, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if (self.provider == nil) {
            reject("E_PEACH_MOBILE", "Provider not set. This probably means you forgot to initialize the provider.", NSError(domain: "", code: 6001, userInfo: nil))
            return;
        }
        
        guard let transaction = createTransaction(
            checkoutID: transactionDict["checkoutID"]!,
            paymentBrand: transactionDict["paymentBrand"]!,
            cardHolder: transactionDict["cardHolder"]!,
            cardNumber: transactionDict["cardNumber"]!,
            cardExpiryMonth: transactionDict["cardExpiryMonth"]!,
            cardExpiryYear: transactionDict["cardExpiryYear"]!,
            cardCVV: transactionDict["cardCVV"]!
            ) else {
                reject("E_PEACH_MOBILE" , "Invalid payment params.", NSError(domain: "", code: 3001, userInfo: nil))
                return
        }
        
        self.provider!.submitTransaction(transaction, completionHandler: {(transaction, error) in
            DispatchQueue.main.async {
                self.handleTransactionSubmission(transaction: transaction, error: error as NSError?, resolver: resolve, rejecter: reject)
            }
        })
    }
    
    @objc func getResourcePath(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let checkoutID = self.transaction?.paymentParams.checkoutID else {
            reject("E_PEACH_MOBILE", "Checkout ID is invalid", NSError(domain: "", code: 200, userInfo: nil))
            return
        }
        if (self.provider == nil) {
            reject("E_PEACH_MOBILE", "Provider not set. This probably means you forgot to initialize the provider.", NSError(domain: "", code: 6001, userInfo: nil))
            return;
        }
        
        self.provider!.requestCheckoutInfo(withCheckoutID: checkoutID) { (checkoutInfo, error) in
            DispatchQueue.main.async {
                guard let resourcePath = checkoutInfo?.resourcePath else {
                    reject("E_PEACH_MOBILE", "Checkout info is empty or doesn't contain resource path", NSError(domain: "", code: 200, userInfo: nil))
                    return
                }
                
                resolve(resourcePath)
            }
        }
    }
    
    private func createTransaction(checkoutID: String, paymentBrand: String, cardHolder: String?, cardNumber: String, cardExpiryMonth: String, cardExpiryYear: String, cardCVV: String) -> OPPTransaction? {
        do {
            let params = try OPPCardPaymentParams.init(checkoutID: checkoutID, holder: cardHolder, number: cardNumber, expiryMonth: cardExpiryMonth, expiryYear: cardExpiryYear, cvv: cardCVV)
            params.shopperResultURL = self.urlScheme! + "://result";
            return OPPTransaction.init(paymentParams: params);
        } catch {
            return nil
        }
    }
    
    private func handleTransactionSubmission(transaction: OPPTransaction?, error: NSError?, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        guard let transaction = transaction else {
            reject("E_PEACH_MOBILE", error?.localizedDescription ?? "Invalid transaction.", error);
            return
        }
        
        self.transaction = transaction
        if transaction.type == .synchronous {
            resolve(["transactionType": "synchronous"])
        } else if transaction.type == .asynchronous {
            NotificationCenter.default.addObserver(self, selector: #selector(self.didReceiveAsynchronousPaymentCallback), name: Notification.Name(rawValue: AsyncPaymentCompletedNotificationKey), object: nil)
            resolve(["transactionType": "synchronous", "redirectUrl": self.transaction!.redirectURL!])
        } else {
            reject("E_PEACH_MOBILE", "Invalid transaction.", NSError(domain: "", code: 2005, userInfo: nil));
        }
    }
    
    @objc func didReceiveAsynchronousPaymentCallback() {
        NotificationCenter.default.removeObserver(self, name: Notification.Name(rawValue: AsyncPaymentCompletedNotificationKey), object: nil)
        sendEvent(withName: "asynchronousPaymentCallback", body: nil)
    }
    
    override func supportedEvents() -> [String]! {
        return ["asynchronousPaymentCallback"]
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
