//
//  Copyright (c) 2016-2023, Nuralogix Corp.
//  All Rights reserved
//  THIS SOFTWARE IS LICENSED BY AND IS THE CONFIDENTIAL AND
//  PROPRIETARY PROPERTY OF NURALOGIX CORP. IT IS
//  PROTECTED UNDER THE COPYRIGHT LAWS OF THE USA, CANADA
//  AND OTHER FOREIGN COUNTRIES. THIS SOFTWARE OR ANY
//  PART THEREOF, SHALL NOT, WITHOUT THE PRIOR WRITTEN CONSENT
//  OF NURALOGIX CORP, BE USED, COPIED, DISCLOSED,
//  DECOMPILED, DISASSEMBLED, MODIFIED OR OTHERWISE TRANSFERRED
//  EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF A
//  NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
//

import Foundation
import UIKit

// MeasurementResultsSubscriber creates a WebSocket connection to DeepAffex API
// to subscribe to results.
//
// Reference: https://dfxapiversion10.docs.apiary.io/#reference/0/measurements/subscribe-to-results

protocol MeasurementResultsSubscriberDelegate : AnyObject {
    func didGetResults(_ subscriber: MeasurementResultsSubscriber, data: Data)
    func didGetError(_ subscriber: MeasurementResultsSubscriber, error: Error?)
    func didConnect(_ subscriber: MeasurementResultsSubscriber)
    func didDisconnect(_ subscriber: MeasurementResultsSubscriber)
}

class MeasurementResultsSubscriber {
    
    weak var delegate : MeasurementResultsSubscriberDelegate?
    var delegateQueue = DispatchQueue.main
    var lastChunkNumber : Int = 0
    
    private let websocketClient : WebSocket
    private var request : URLRequest
    private var requestID = 0
    private var isConnected = false
    private var isSubscribedToResults = false
    private var operationQueue : OperationQueue
    private var measurementID : String = ""
    private var watchdogTimer : Timer?
    
    init(token: String) {
        let endpoint = WebSocketEndpoint(token: token)
        request = endpoint.request!
        
        operationQueue = OperationQueue()
        operationQueue.maxConcurrentOperationCount = 1
        operationQueue.isSuspended = false
        
        websocketClient = WebSocket(request: request)
        websocketClient.respondToPingWithPong = true
        websocketClient.onEvent = { [weak self] event in
            self?.delegateQueue.async {
                guard let self = self else {
                    return
                }
                
                self.operationQueue.isSuspended = false
                
                switch event {
                case .connected(_):
                    self.resubscribeToResultsIfNeeded()
                    self.delegate?.didConnect(self)
                case .disconnected(_, _):
                    self.reconnectIfNeeded()
                    self.delegate?.didDisconnect(self)
                case .binary(let data):
                    self.delegate?.didGetResults(self, data: data.responseBody)
                case .error(let error):
                    self.reconnectIfNeeded()
                    self.delegate?.didGetError(self, error: error)
                case .ping(_):
                    self.restartWatchdogTimer()
                default:
                    return
                }
            }            
        }
        
        let notificationCenter = NotificationCenter.default
        
        // Observe app state to disconnect websocket connection
        notificationCenter.addObserver(self, selector: #selector(appWillResignActive),
                                       name: UIApplication.willResignActiveNotification,
                                       object: nil)
    }
    
    deinit {
        cancelResultsSubscription()
        NotificationCenter.default.removeObserver(self)
    }
    
    func subscribeToResults(measurementID: String) {
        addOperation { [weak self] in
            self?.sendSubscribeToResultsRequest(measurementID: measurementID)
            return true
        }
    }
    
    func cancelResultsSubscription() {
        operationQueue.cancelAllOperations()
        operationQueue.isSuspended = false
        measurementID = ""
        isSubscribedToResults = false
        disconnectSocket()
        watchdogTimer?.invalidate()
        lastChunkNumber = 0
    }
    
    func connect() {
        addOperation(connectSocket)
    }
    
    func disconnect() {
        addOperation(disconnectSocket)
    }
    
    func writeData(_ data: Data) {
        addOperation { [weak self] in
            self?.writeDataToSocket(data) ?? false
        }
    }

    // Helpers
    
    private func addOperation(_ block: @escaping () -> Bool) {
        operationQueue.addOperation { [weak self] in
            self?.operationQueue.isSuspended = block()
        }
    }
    
    private func sendSubscribeToResultsRequest(measurementID: String) {
        self.measurementID = measurementID
        let requestIDString = generateNewRequestID()
        let jsonRequestBody : [String: Any] = ["Params": ["ID":measurementID],
                                               "RequestID": requestIDString]
        let requestBodyData = try! JSONSerialization.data(withJSONObject: jsonRequestBody, options: [])
        let data = createRequest(actionID: 510,
                                 requestID: requestIDString,
                                 requestData: requestBodyData)
        
        writeData(data)
        isSubscribedToResults = true
    }
    
    private func sendGetIntermediateResultsRequest(measurementID: String, chunkOrder: Int) {
        self.measurementID = measurementID
        let requestIDString = generateNewRequestID()
        let jsonRequestBody : [String: Any] = ["Params": ["ID":measurementID,
                                                          "chunkOrder": chunkOrder],
                                               "RequestID": requestIDString]
        let requestBodyData = try! JSONSerialization.data(withJSONObject: jsonRequestBody, options: [])
        let data = createRequest(actionID: 523,
                                 requestID: requestIDString,
                                 requestData: requestBodyData)
        
        writeData(data)
    }
    
    private func reconnectIfNeeded() {
        if isSubscribedToResults && !measurementID.isEmpty {
            connect()
        }
    }
    
    private func resubscribeToResultsIfNeeded() {
        if isSubscribedToResults && !measurementID.isEmpty {
            subscribeToResults(measurementID: measurementID)
            sendGetIntermediateResultsRequest(measurementID: measurementID,
                                              chunkOrder: lastChunkNumber)
        }
    }
    
    @discardableResult
    private func connectSocket() -> Bool {
        if !isConnected {
            websocketClient.connect()
            isConnected = true
            return true
        } else {
            return false
        }
    }
    
    @discardableResult
    private func disconnectSocket() -> Bool {
        if isConnected {
            websocketClient.disconnect()
            isConnected = false
            return true
        } else {
            return false
        }
    }
    
    @discardableResult
    private func writeDataToSocket(_ data: Data) -> Bool {
        websocketClient.write(data: data)
        return true
    }
    
    private func createRequest(actionID: Int, requestID: String, requestData: Data) -> Data {
        let actionIDString = generateActionID(actionID)
        var data = createRequestHeader(actionIDString, requestID)
        data.append(requestData)
        return data
    }
    
    func generateNewRequestID() -> String {
        requestID += 1
        return String(format: "%010x", requestID)
    }
    
    func generateActionID(_ actionID: Int) -> String {
        return "\(actionID)".padding(toLength: 4, withPad: " ", startingAt: 0)
    }
    
    func createRequestHeader(_ actionIDString: String, _ requestID: String) -> Data {
        return "\(actionIDString)\(requestID)".data(using: .ascii)!
    }
    
    func restartWatchdogTimer() {
        DispatchQueue.main.async {
            self.watchdogTimer?.invalidate()
            self.watchdogTimer = Timer.scheduledTimer(withTimeInterval: 5, 
                                                      repeats: true,
                                                      block: { [weak self] _ in
                self?.disconnect()
                self?.connect()
            })
        }
    }
}

extension MeasurementResultsSubscriber {
    @objc func appWillResignActive() {
        cancelResultsSubscription()
    }
}
