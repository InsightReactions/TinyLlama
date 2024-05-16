//
//  ContentView.swift
//  TinyLlama
//
//  Created by Brian Erikson (Work) on 5/16/24.
//

import SwiftUI
import SwiftData
import Network
import dnssd

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var items: [Item]
    
    private var endpoint: NWEndpoint = NWEndpoint.service(name: "Tiny Llama", type: "_http._tcp", domain: "local", interface: nil)
    @State private var bonjourResolver: BonjourResolver? = nil

    var body: some View {
        
        NavigationSplitView {
            Text("Hello Tiny Llama")
            .onAppear {
                let completionHandler: BonjourResolver.CompletionHandler = {
                    result in switch result {
                    case .success(let (string, int)):
                        print("recieved success response: \(string) - \(int)")
                        bonjourResolver?.stop()
                        bonjourResolver = nil
                        // TODO: Open web browser with IP address
                    case .failure(let error):
                        print("Error: \(error.localizedDescription)")
                    }
                }
                if (bonjourResolver != nil) {
                    bonjourResolver?.stop()
                }
                print("Starting Bonjour Resolver")
                bonjourResolver = BonjourResolver.resolve(endpoint: endpoint, completionHandler: completionHandler)
            }
            .onDisappear {
                print("Stopping Bonjour Resolver")
                bonjourResolver?.stop()
                bonjourResolver = nil
            }
        } detail: {
            Text("Select an item")
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Item.self, inMemory: true)
}
