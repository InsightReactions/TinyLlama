import Foundation
import Network
import dnssd

final class BonjourResolver: NSObject, NetServiceDelegate {

    typealias CompletionHandler = (Result<(String, Int), Error>) -> Void

    @discardableResult
    static func resolve(endpoint: NWEndpoint, completionHandler: @escaping CompletionHandler) -> BonjourResolver {
        dispatchPrecondition(condition: .onQueue(.main))
        let resolver = BonjourResolver(endpoint: endpoint, completionHandler: completionHandler)
        resolver.start()
        return resolver
    }
    
    private init(endpoint: NWEndpoint, completionHandler: @escaping CompletionHandler) {
        self.endpoint = endpoint
        self.completionHandler = completionHandler
    }
    
    deinit {
        // If these fire the last reference to us was released while the resolve
        // was still in flight.  That should never happen because we retain
        // ourselves in `start()`.
        assert(self.refQ == nil)
        assert(self.completionHandler == nil)
    }
    
    let endpoint: NWEndpoint
    private var refQ: DNSServiceRef? = nil
    private var completionHandler: (CompletionHandler)? = nil
    
    private func start() {
        dispatchPrecondition(condition: .onQueue(.main))
        precondition(self.refQ == nil)
        precondition(self.completionHandler != nil)
        
        do {
            guard
                case .service(name: let name, type: let type, domain: let domain, interface: let interface) = self.endpoint,
                let interfaceIndex = UInt32(exactly: interface?.index ?? 0)
            else {
                throw NWError.posix(.EINVAL)
            }

            let context = Unmanaged.passUnretained(self)
            var refQLocal: DNSServiceRef? = nil
            var err = DNSServiceResolve(
                &refQLocal,
                0,
                interfaceIndex,
                name, type, domain,
                { _, _, _, err, _, hostQ, port, _, _, context in
                    // We ignore the ‘more coming’ flag because we are a
                    // one-shot operation.
                    let obj = Unmanaged<BonjourResolver>.fromOpaque(context!).takeUnretainedValue()
                    obj.resolveDidComplete(err: err, hostQ: hostQ, port: UInt16(bigEndian: port))
                }, context.toOpaque())
            guard err == kDNSServiceErr_NoError else {
                throw NWError.dns(err)
            }
            let ref = refQLocal

            err = DNSServiceSetDispatchQueue(ref, .main)
            guard err == kDNSServiceErr_NoError else {
                DNSServiceRefDeallocate(ref)
                throw NWError.dns(err)
            }
            
            // The async operation is now started, so we retain ourselves.  This
            // is cleaned up when the operation stops in `stop(with:)`.

            self.refQ = ref
            _ = context.retain()
        } catch {
            let completionHandler = self.completionHandler
            self.completionHandler = nil
            completionHandler?(.failure(error))
        }
    }
    
    func stop() {
        self.stop(with: .failure(CocoaError(.userCancelled)))
    }
    
    private func stop(with result: Result<(String, Int), Error>) {
        dispatchPrecondition(condition: .onQueue(.main))

        if let ref = self.refQ {
            self.refQ = nil
            DNSServiceRefDeallocate(ref)
            Unmanaged.passUnretained(self).release()
        }
        
        if let completionHandler = self.completionHandler {
            self.completionHandler = nil
            completionHandler(result)
        }
    }
    
    private func resolveDidComplete(err: DNSServiceErrorType, hostQ: UnsafePointer<CChar>?, port: UInt16) {
        if err == kDNSServiceErr_NoError {
            self.stop(with: .success((String(cString: hostQ!), Int(port))))
        } else {
            self.stop(with: .failure(NWError.dns(err)))
        }
    }
}
