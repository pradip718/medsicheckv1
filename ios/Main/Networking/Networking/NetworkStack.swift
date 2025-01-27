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

// Forked from https://github.com/AndrejKolar/NetworkStack

import Foundation
import UIKit

// Types

public typealias NetworkResult<T> = Result<T, Error>
public typealias ResultCallback<T> = (NetworkResult<T>) -> Void


public enum NetworkStackError: Error {
    case unknown
    case invalidRequest
    case dataMissing
    case endpointNotMocked
    case mockDataMissing
}

// WebService

public protocol WebServiceProtocol {
    func request<T: Decodable>(requestID: String, 
                               _ endpoint: Endpoint,
                               waitFor duration: TimeInterval,
                               completion: @escaping ResultCallback<T>)
    func request<T: Decodable>(_ endpoint: Endpoint, 
                               waitFor duration: TimeInterval,
                               completion: @escaping ResultCallback<T>)
    func clearRequests()
}

extension WebServiceProtocol {
    public func request<T: Decodable>(_ endpoint: Endpoint,
                           waitFor duration: TimeInterval,
                           completion: @escaping ResultCallback<T>) {
        request(requestID: UUID().uuidString,
                endpoint,
                waitFor: duration,
                completion: completion)
    }
}

public class WebService: WebServiceProtocol {
    
    struct RequestMetadata {
        var endpoint : Endpoint
        var retries : Int = 0
    }
    
    private let urlSession: URLSession
    private let parser: Parser
    private let networkActivity: NetworkActivityProtocol
    private let operationQueue: OperationQueue
    private let networkOperationQueue: OperationQueue
    private var currentRequests : [String: RequestMetadata]
    private let maximumRetries : Int = 4
    
    public init(urlSession: URLSession = URLSession(configuration: URLSessionConfiguration.default),
                parser: Parser = Parser(),
                networkActivity: NetworkActivityProtocol = NetworkActivity(),
                operationQueue: OperationQueue = OperationQueue(),
                networkOperationQueue: OperationQueue = OperationQueue()) {
        self.urlSession = urlSession
        self.parser = parser
        self.networkActivity = networkActivity
        self.operationQueue = operationQueue
        self.networkOperationQueue = networkOperationQueue
        self.networkOperationQueue.maxConcurrentOperationCount = 1
        self.currentRequests = [:]
    }
    
    public func clearRequests() {
        networkOperationQueue.cancelAllOperations()
        currentRequests = [:]
    }
    
    public func request<T: Decodable>(requestID: String = UUID().uuidString,
                                      _ endpoint: Endpoint,
                                      waitFor duration: TimeInterval = 0,
                                      completion: @escaping ResultCallback<T>) {
        
        let requestMetaData = currentRequests[requestID, default: RequestMetadata(endpoint: endpoint, retries: 0)]
        currentRequests[requestID] = requestMetaData
        
        let failRequest = { (error : Error) in
            self.operationQueue.addOperation({ completion(.failure(error)) })
            self.currentRequests.removeValue(forKey: requestID)
        }
        
        guard let request = endpoint.request else {
            failRequest(NetworkStackError.invalidRequest)
            return
        }
        
        networkOperationQueue.addOperation {
            sleep(UInt32(duration))
        }
        
        networkOperationQueue.addOperation { [weak self] in
            guard let self else {
                return
            }
            
            self.networkActivity.increment()
            
            let task = self.urlSession.dataTask(with: request) { (data, response, error) in
                self.networkActivity.decrement()
                
                if let error = error as? NSError {
                    let errorCode = error.code
                    switch errorCode {
                        case 
                        NSURLErrorTimedOut,
                        NSURLErrorCannotConnectToHost,
                        NSURLErrorNotConnectedToInternet,
                        NSURLErrorNetworkConnectionLost,
                        NSURLErrorDataNotAllowed:
                        
                        if self.currentRequests[requestID]?.retries ?? 0 < self.maximumRetries {
                            self.currentRequests[requestID]?.retries += 1
                            self.request(requestID: requestID,
                                         endpoint,
                                         waitFor: 3.0,
                                         completion: completion)
                        } else {
                            failRequest(error)
                        }
                        return
                    default:
                        failRequest(error)
                        return
                    }
                }
                
                if let error = error {
                    failRequest(error)
                    return
                }
                
                guard let data = data else {
                    failRequest(NetworkStackError.dataMissing)
                    return
                }
                
                if let statusCode = HTTPStatusCode(rawValue: (response as? HTTPURLResponse)?.statusCode ?? -1) {
                    if statusCode.responseType == .success {
                        self.parser.json(data: data, completion: completion)
                    } else {
                        failRequest(statusCode)
                    }
                }
                self.currentRequests.removeValue(forKey: requestID)
            }
            
            task.resume()
        }
    }
}

// Mock WebService

class MockWebService: WebServiceProtocol {
    private let parser: Parser
    
    init(parser: Parser = Parser()) {
        self.parser = parser
    }
    
    func clearRequests() {
        return
    }
    
    func request<T: Decodable>(requestID: String,
                               _ endpoint: Endpoint,
                               waitFor duration: TimeInterval = 0,
                               completion: @escaping ResultCallback<T>) {
        
        guard let endpoint = endpoint as? MockEndpoint else {
            OperationQueue.main.addOperation({ completion(.failure(NetworkStackError.endpointNotMocked)) })
            return
        }
        
        guard let data = endpoint.mockData() else {
            OperationQueue.main.addOperation({ completion(.failure(NetworkStackError.mockDataMissing)) })
            return
        }
        
        parser.json(data: data, completion: completion)
    }
}

// Network Activity

public protocol NetworkActivityProtocol {
    func increment()
    func decrement()
}

public class NetworkActivity: NetworkActivityProtocol {
    public init() {
        
    }
    
    private var activityCount: Int = 0
    
    public func increment() {
        OperationQueue.main.addOperation({ self.activityCount += 1 })
    }
    
    public func decrement() {
        OperationQueue.main.addOperation({ self.activityCount -= 1 })
    }
}

// Parser

public protocol ParserProtocol {
    func json<T: Decodable>(data: Data, completion: @escaping ResultCallback<T>)
}

public struct Parser {
    public init() {
        
    }
    
    public let jsonDecoder = JSONDecoder()
    
    public func json<T: Decodable>(data: Data, completion: @escaping ResultCallback<T>) {
        do {
            let result: T = try jsonDecoder.decode(T.self, from: data)
            OperationQueue.main.addOperation { completion(.success(result)) }
            
        } catch let parseError {
            OperationQueue.main.addOperation { completion(.failure(parseError)) }
        }
    }
}

// Endpoint

public enum HTTPMethod : String {
    case GET
    case POST
    case DELETE
    case PUT
    case HEAD
    case CONNECT
    case OPTIONS
    case TRACE
}

public protocol Endpoint {
    var request: URLRequest? { get }
    var httpMethod: HTTPMethod { get }
    var httpHeaders: [String : String]? { get }
    var queryItems: [URLQueryItem]? { get }
    var scheme: String { get }
    var host: String { get }
    var port: Int { get }
    var errorType: GenericError { get }
}

public extension Endpoint {
    func request(forEndpoint endpoint: String) -> URLRequest? {
        
        var urlComponents = URLComponents()
        urlComponents.scheme = scheme
        urlComponents.host = host
        urlComponents.path = endpoint
        urlComponents.queryItems = queryItems
        urlComponents.port = port
        guard let url = urlComponents.url else { return nil }
        var request = URLRequest(url: url)
        request.httpMethod = httpMethod.rawValue
        
        if let httpHeaders = httpHeaders {
            for (key, value) in httpHeaders {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }
        
        return request
    }
    
    func request<T: Encodable>(forEndpoint endpoint: String, body: T) -> URLRequest? {
        var r = request(forEndpoint: endpoint)
        r?.httpBody = try? JSONEncoder().encode(body)
        
        return r
    }
    
}

// Mock Endpoint

protocol MockEndpoint: Endpoint {
    var mockFilename: String? { get }
    var mockExtension: String? { get }
}


extension MockEndpoint {
    func mockData() -> Data? {
        guard let mockFileUrl = Bundle.main.url(forResource: mockFilename, withExtension: mockExtension),
            let mockData = try? Data(contentsOf: mockFileUrl) else {
                return nil
        }
        return mockData
    }
}

extension MockEndpoint {
    var mockExtension: String? {
        return "json"
    }
}

public protocol GenericError : Codable {
    var code: String { get set }
    var message: String { get set }
}
