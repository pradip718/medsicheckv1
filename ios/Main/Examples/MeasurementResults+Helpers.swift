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
import AnuraCore

// A MeasurementResults object contains the decoded results of a
// measurement chunk from DeepAffex API, and provide convienence
// methods to access the result values. In the last chunk of a
// successful measurement, the full set of results from your
// study can be accessed through the `allResults` property.
//
// A list of all the available results and their signal IDs is
// available through the documentation link below:
//
// https://docs.deepaffex.ai/core/8_results.html

extension MeasurementResults {
    
    // Examples of how to get the results of specific signal IDs
    var mentalStressIndex : Double {
        result(for: "MSI")
    }
    
    var bloodPressure : (Double, Double)  {
        (result(for: "BP_SYSTOLIC"), result(for: "BP_DIASTOLIC"))
    }

}
