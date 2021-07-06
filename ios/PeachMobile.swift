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
    var urlScheme: String = ""

    @objc func initPaymentProvider(_ mode: String) {
        var oppProviderMode: OPPProviderMode
        if (mode == "live") {
            oppProviderMode = OPPProviderMode.live
        } else {
            oppProviderMode = OPPProviderMode.test
        }
        self.provider = OPPPaymentProvider.init(mode: oppProviderMode)
    }

    @objc func setUrlScheme(_ urlScheme: String) {
        self.urlScheme = urlScheme
    }

    @objc func createTransaction(_ checkoutID: String, paymentBrand: String, cardHolder: String, cardNumber: String, cardExpiryMonth: String, cardExpiryYear: String, cardCVV: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        if (self.urlScheme == "") {
            reject("", "ShopperResultURL is nil. This probably means you forgot to set it.", NSError(domain: "", code: 3001, userInfo: nil))
            return
        }

        do {
            _ = try createOPPTransaction(checkoutID: checkoutID, paymentBrand: paymentBrand, cardHolder: cardHolder, cardNumber: cardNumber, cardExpiryMonth: cardExpiryMonth, cardExpiryYear: cardExpiryYear, cardCVV: cardCVV)
            resolve([
                "checkoutID": checkoutID,
                "paymentBrand": paymentBrand,
                "cardHolder": cardHolder,
                "cardNumber": cardNumber,
                "cardExpiryMonth": cardExpiryMonth,
                "cardExpiryYear": cardExpiryYear,
                "cardCVV": cardCVV
                ])
        } catch let error {
            reject(String((error as NSError).code) , error.localizedDescription, error)
            return
        }
    }

    @objc func createTransactionWithToken(_ checkoutID: String, paymentBrand: String, tokenID: String, cardCVV: String?, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {

        do {
            _ = try createOPPTransaction(checkoutID: checkoutID, tokenID: tokenID, paymentBrand: paymentBrand, cvv: cardCVV)
            resolve([
                "checkoutID": checkoutID,
                "paymentBrand": paymentBrand,
                "tokenID": tokenID,
                "cardCVV": cardCVV == nil ? "" : cardCVV
                ])
        } catch let error {
            reject(String((error as NSError).code) , error.localizedDescription, error)
            return
        }
    }

    @objc func submitTransaction(_ transactionDict: Dictionary<String, String>, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if (self.provider == nil) {
            reject("", "Provider not set. This probably means you forgot to initialize the provider.", NSError(domain: "", code: 6001, userInfo: nil))
            return
        }

        do {
            var transaction: OPPTransaction?;
            if (transactionDict["tokenID"] != nil) {
                transaction = try createOPPTransaction(checkoutID: transactionDict["checkoutID"]!, tokenID: transactionDict["tokenID"]!, paymentBrand: transactionDict["paymentBrand"]!, cvv: transactionDict["cardCVV"]! == "" ? nil : transactionDict["cardCVV"]!)
            } else {
                transaction = try createOPPTransaction(
                    checkoutID: transactionDict["checkoutID"]!,
                    paymentBrand: transactionDict["paymentBrand"]!,
                    cardHolder: transactionDict["cardHolder"]!,
                    cardNumber: transactionDict["cardNumber"]!,
                    cardExpiryMonth: transactionDict["cardExpiryMonth"]!,
                    cardExpiryYear: transactionDict["cardExpiryYear"]!,
                    cardCVV: transactionDict["cardCVV"]!
                    )
            }
            self.provider!.submitTransaction(transaction!, completionHandler: { (completedTransaction, error) in
                DispatchQueue.main.async {
                    self.handleTransactionSubmission(transaction: completedTransaction, error: error, resolver: resolve, rejecter: reject)
                }
            })
        } catch let error {
            reject(String((error as NSError).code) , error.localizedDescription, error)
            return
        }
    }

    @objc func submitRegistration(_ transactionDict: Dictionary<String, String>, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if (self.provider == nil) {
            reject("", "Provider not set. This probably means you forgot to initialize the provider.", NSError(domain: "", code: 6001, userInfo: nil))
            return
        }

        do {
            let params = try OPPCardPaymentParams(
                checkoutID: transactionDict["checkoutID"]!,
                paymentBrand: transactionDict["paymentBrand"]!,
                holder: transactionDict["cardHolder"]!,
                number: transactionDict["cardNumber"]!,
                expiryMonth: transactionDict["cardExpiryMonth"]!,
                expiryYear: transactionDict["cardExpiryYear"]!,
                cvv: transactionDict["cardCVV"]!
            );
            params.shopperResultURL = self.urlScheme + "://payment"
            let transaction = OPPTransaction(paymentParams: params)

            self.provider!.register(transaction, completionHandler: { (completedTransaction, error) in
                DispatchQueue.main.async {
                    self.handleTransactionSubmission(transaction: completedTransaction, error: error, resolver: resolve, rejecter: reject)
                }
            })
        } catch let error {
            reject(String((error as NSError).code) , error.localizedDescription, error)
            return
        }
    }

    @objc func getResourcePath(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let checkoutID = self.transaction?.paymentParams.checkoutID else {
            reject("", "Checkout ID is invalid", NSError(domain: "", code: 200, userInfo: nil))
            return
        }
        if (self.provider == nil) {
            reject("", "Provider not set. This probably means you forgot to initialize the provider.", NSError(domain: "", code: 6001, userInfo: nil))
            return
        }

        self.provider!.requestCheckoutInfo(withCheckoutID: checkoutID) { (checkoutInfo, error) in
            DispatchQueue.main.async {
                if (error != nil) {
                    reject(String((error! as NSError).code), error?.localizedDescription, error)
                }
                guard let resourcePath = checkoutInfo?.resourcePath else {
                    reject("", "Checkout info is empty or doesn't contain resource path", NSError(domain: "", code: 200, userInfo: nil))
                    return
                }
                resolve(resourcePath)
            }
        }
    }

    private func createOPPTransaction(checkoutID: String, paymentBrand: String, cardHolder: String, cardNumber: String, cardExpiryMonth: String, cardExpiryYear: String, cardCVV: String) throws -> OPPTransaction? {
        do {
            let params = try OPPCardPaymentParams.init(checkoutID: checkoutID, paymentBrand: paymentBrand, holder: cardHolder, number: cardNumber, expiryMonth: cardExpiryMonth, expiryYear: cardExpiryYear, cvv: cardCVV)
            params.shopperResultURL = self.urlScheme + "://payment"
            return OPPTransaction.init(paymentParams: params)
        } catch let error {
            throw error
        }
    }

    private func createOPPTransaction(checkoutID: String, tokenID: String, paymentBrand: String, cvv: String?) throws -> OPPTransaction? {
        do {
            let params: OPPTokenPaymentParams
            let tempPaymentBrand = paymentBrand != "" ? paymentBrand : "VISA"
            if (cvv != nil) {
                params = try OPPTokenPaymentParams.init(checkoutID: checkoutID, tokenID: tokenID, cardPaymentBrand: paymentBrand, cvv: cvv)
            } else {
                params = try OPPTokenPaymentParams.init(checkoutID: checkoutID, tokenID: tokenID, paymentBrand: tempPaymentBrand)
            }
            params.shopperResultURL = self.urlScheme != "" ? self.urlScheme + "://payment" : "payments://paymnet";

            return OPPTransaction.init(paymentParams: params)
        } catch let error {
            throw error
        }
    }

    private func handleTransactionSubmission(transaction: OPPTransaction?, error: Error?, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        guard let transaction = transaction else {
            reject(String((error! as NSError).code), error?.localizedDescription ?? "Invalid transaction.", error)
            return
        }

        self.transaction = transaction
        if transaction.type == .synchronous {
            resolve(["transactionType": "synchronous"])
        } else if transaction.type == .asynchronous {
            NotificationCenter.default.addObserver(self, selector: #selector(self.didReceiveAsynchronousPaymentCallback), name: Notification.Name(rawValue: AsyncPaymentCompletedNotificationKey), object: nil)
            resolve(["transactionType": "asynchronous", "redirectUrl": self.transaction!.redirectURL!.absoluteString])
        } else {
            print(error)
            reject(String((error! as NSError).code), error?.localizedDescription ?? "Invalid transaction.", error)
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
