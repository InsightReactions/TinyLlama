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
import AsyncDNSResolver

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.openURL) private var openURL
    @Query private var items: [Item]
    private var endpoint: NWEndpoint = NWEndpoint.service(name: "Tiny Llama", type: "_http._tcp", domain: "local", interface: nil)
    @State private var bonjourResolver: BonjourResolver? = nil
    
    private func stopBonjourResolver() {
        if (bonjourResolver != nil) {
            print("Stopping Bonjour Resolver")
            bonjourResolver?.stop()
            bonjourResolver = nil
        }
    }
    
    private func onTinyLlamaHostResolved(host: String) {
        Task(priority: .medium) {
            do {
                let resolver = try AsyncDNSResolver()
                let aRecords = try await resolver.queryA(name: host)
                let address = aRecords.first?.address.address
                if address != nil {
                    let url = URL(string: "http://\(address!)")
                    if url != nil {
                        openURL(url!)
                    } else {
                        print("Unable to resolve URL for Tiny Llama Service")
                    }
                } else {
                    print("Unable to resolve IP Address for Tiny Llama Service")
                }
            } catch {
                print("Unable to query DNS Resolver for Tiny Llama Service")
            }
        }
    }

    var body: some View {
        
        NavigationSplitView {
            Text("Hello Tiny Llama")
            .onAppear {
                let completionHandler: BonjourResolver.CompletionHandler = {
                    result in switch result {
                    case .success(let (string, int)):
                        print("recieved success response: \(string) - \(int)")
                        stopBonjourResolver()
                        onTinyLlamaHostResolved(host: string)
                    case .failure(let error):
                        print("Error: \(error.localizedDescription)")
                    }
                }
                stopBonjourResolver()
                print("Starting Bonjour Resolver")
                bonjourResolver = BonjourResolver.resolve(endpoint: endpoint, completionHandler: completionHandler)
            }
            .onDisappear {
                stopBonjourResolver()
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