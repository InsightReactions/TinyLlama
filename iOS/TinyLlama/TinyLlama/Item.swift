//
//  Item.swift
//  TinyLlama
//
//  Created by Brian Erikson (Work) on 5/16/24.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
