import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

persistent actor ClientStorage {
    
    // Define the Client type
    public type Client = {
        firstName: Text;
        lastName: Text;
        companyName: Text;
        companyWebsite: ?Text; // Optional website URL
        industry: Text;
        businessType: Text;
        numberOfEmployees: Nat;
        phoneNumber: Text;
        description: Text;
    };

    // Error types
    public type Error = {
        #NotFound;
        #AlreadyExists;
        #Unauthorized;
        #InvalidData;
    };

    // Stable storage for upgrades
    private var clientsEntries : [(Principal, Client)] = [];
    private transient var clients = HashMap.HashMap<Principal, Client>(10, Principal.equal, Principal.hash);

    // System functions for upgrades
    system func preupgrade() {
        clientsEntries := Iter.toArray(clients.entries());
    };

    system func postupgrade() {
        clients := HashMap.fromIter<Principal, Client>(
            clientsEntries.vals(), 
            clientsEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        clientsEntries := [];
    };

    // Validate client data
    private func validateClient(client: Client) : Bool {
        Text.size(client.firstName) > 0 and
        Text.size(client.lastName) > 0 and
        Text.size(client.companyName) > 0 and
        Text.size(client.industry) > 0 and
        Text.size(client.businessType) > 0 and
        Text.size(client.phoneNumber) > 0 and
        Text.size(client.description) > 0
    };

    // Store client profile
    public shared(msg) func storeClient(client: Client) : async Result.Result<(), Error> {
        let caller = msg.caller;
        
        // Validate client data
        if (not validateClient(client)) {
            return #err(#InvalidData);
        };

        // Store the client
        clients.put(caller, client);
        #ok(())
    };

    // Update client profile (only the owner can update)
    public shared(msg) func updateClient(client: Client) : async Result.Result<(), Error> {
        let caller = msg.caller;
        
        // Check if client exists
        switch (clients.get(caller)) {
            case null { #err(#NotFound) };
            case (?_existing) {
                // Validate client data
                if (not validateClient(client)) {
                    return #err(#InvalidData);
                };
                
                // Update the client
                clients.put(caller, client);
                #ok(())
            };
        }
    };

    // Get client by principal
    public query func getClient(principal: Principal) : async Result.Result<Client, Error> {
        switch (clients.get(principal)) {
            case null { #err(#NotFound) };
            case (?client) { #ok(client) };
        }
    };

    // Get caller's own profile
    public shared(msg) func getMyProfile() : async Result.Result<Client, Error> {
        let caller = msg.caller;
        switch (clients.get(caller)) {
            case null { #err(#NotFound) };
            case (?client) { #ok(client) };
        }
    };

    // Delete client profile (only owner can delete)
    public shared(msg) func deleteClient() : async Result.Result<(), Error> {
        let caller = msg.caller;
        switch (clients.remove(caller)) {
            case null { #err(#NotFound) };
            case (?_removed) { #ok(()) };
        }
    };

    // Get all clients
    public query func getAllClients() : async [(Principal, Client)] {
        Iter.toArray(clients.entries())
    };
}