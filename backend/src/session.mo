import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import _Utils "./utils";

module {
    public type Session = {
        sessionId: Text;
        email: Text;
        userType: Text;
        createdAt: Int;
        expiresAt: Int;
    };

    public type SessionInfo = {
        sessionId: Text;
        userType: Text;
        expiresAt: Int;
    };

    public class SessionManager() {
        private var sessions = HashMap.HashMap<Text, Session>(10, Text.equal, Text.hash);
        private let SESSION_DURATION_HOURS : Int = 24;
        private let SESSION_DURATION_NANOSECONDS : Int = SESSION_DURATION_HOURS * 60 * 60 * 1_000_000_000;

        // Generate unique session ID
        public func generateSessionId(email: Text) : async Text {
            let timestamp = Time.now(); 
            let tsText = Int.toText(timestamp);
            let combined = email # tsText;
            combined
        };

        // Create new session
        public func createSession(email: Text, userType: Text) : async Text {
            cleanExpiredSessions();
            
            let sessionId = await generateSessionId(email);
            let currentTime = Time.now();
            let expiresAt = currentTime + SESSION_DURATION_NANOSECONDS;

            let session : Session = {
                sessionId = sessionId;
                email = email;
                userType = userType;
                createdAt = currentTime;
                expiresAt = expiresAt;
            };

            sessions.put(sessionId, session);
            sessionId
        };

        // Validate session and return session data
        public func validateSession(sessionId: Text) : ?Session {
            switch (sessions.get(sessionId)) {
                case null { null };
                case (?session) {
                    let currentTime = Time.now();
                    if (currentTime > session.expiresAt) {
                        sessions.delete(sessionId);
                        null
                    } else {
                        ?session
                    }
                };
            }
        };

        // Get session info for frontend
        public func getSessionInfo(sessionId: Text) : ?SessionInfo {
            switch (validateSession(sessionId)) {
                case null { null };
                case (?session) {
                    ?{
                        sessionId = session.sessionId;
                        userType = session.userType;
                        expiresAt = session.expiresAt;
                    }
                };
            }
        };

        // Remove session (logout)
        public func removeSession(sessionId: Text) : Bool {
            switch (sessions.remove(sessionId)) {
                case null { false };
                case (?_removed) { true };
            }
        };

        // Clean expired sessions
        public func cleanExpiredSessions() : () {
            let currentTime = Time.now();
            let allSessions = Iter.toArray(sessions.entries());
            
            for ((sessionId, session) in allSessions.vals()) {
                if (currentTime > session.expiresAt) {
                    sessions.delete(sessionId);
                };
            };
        };

        // Get active session count
        public func getActiveSessionCount() : Nat {
            cleanExpiredSessions();
            sessions.size()
        };

        // For canister upgrades
        public func preupgrade() : [(Text, Session)] {
            Iter.toArray(sessions.entries())
        };

        public func postupgrade(entries: [(Text, Session)]) : () {
            sessions := HashMap.fromIter<Text, Session>(
                entries.vals(), 
                entries.size(), 
                Text.equal, 
                Text.hash
            );
        };
    };
}