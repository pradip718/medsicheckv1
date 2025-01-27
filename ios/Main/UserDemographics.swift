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

struct AnuraUser: Decodable {
  
  enum Gender : String, Decodable {
    case female
    case male
    case unknown
  }
  
  var partnerID : String?  // Optional string up to 48 characters long
  var height : Int         // cm
  var weight : Int         // kg
  var age    : Int         // years
  var gender : Gender      // male/female
  
  enum CodingKeys: String, CodingKey {
    case partnerID = "partnerID"
    case height = "height"
    case weight = "weight"
    case age = "age"
    case gender = "gender"
  }
  
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    partnerID = (try? container.decode(String.self, forKey: .partnerID)) ?? ""
    height = (try? container.decode(Int.self, forKey: .height)) ?? -1
    weight = (try? container.decode(Int.self, forKey: .weight)) ?? -1
    age = (try? container.decode(Int.self, forKey: .age)) ?? -1
    gender = (try? container.decode(Gender.self, forKey: .gender)) ?? .unknown
  }
  
  public init(partnerID: String = "",
              height: Int = -1,
              weight: Int = -1,
              age: Int = -1,
              gender: Gender = .unknown) {
    self.partnerID = partnerID
    self.height = height
    self.weight = weight
    self.age = age
    self.gender = gender
  }
  
  static var empty : Self {
    return AnuraUser(partnerID: "",
                     height: -1,
                     weight: -1,
                     age: -1,
                     gender: .unknown)
  }
  
  static func convertFromString(_ string: String) -> Self? {
    if let jsonData = string.data(using: .utf8) {
      do {
        let user = try JSONDecoder().decode(Self.self, from: jsonData)
        return user
      } catch {
        print("Error decoding JSON: \(error)")
        return nil
      }
    }
    return nil
  }
  
  var measurementProperties : [String: String] {
    if height == -1 || weight == -1 || age == -1 || gender == .unknown {
        return [:]
    }

      return ["height": String(height),
              "weight": String(weight),
              "age": String(age),
              "gender": gender.rawValue]
  }
}
