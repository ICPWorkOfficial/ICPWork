import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";

actor ICPSwap {
    
    // ===== TYPES =====
    
    public type TokenSymbol = {
        #ICP;
        #ETH;
        #BTC;
        #EOS;
        #USDC;
        #USDT;
    };
    
    public type TokenInfo = {
        symbol: TokenSymbol;
        name: Text;
        decimals: Nat8;
        canisterId: ?Text;
        contractAddress: ?Text;
    };
    
    public type SwapTransaction = {
        id: Text;
        from: TokenSymbol;
        to: TokenSymbol;
        amount: Text;
        converted: Text;
        rate: Float;
        userEmail: Text;
        status: TransactionStatus;
        createdAt: Int;
        updatedAt: Int;
        txHash: ?Text;
    };
    
    public type TransactionStatus = {
        #pending;
        #processing;
        #completed;
        #failed;
        #cancelled;
    };
    
    public type ConversionRequest = {
        from: TokenSymbol;
        to: TokenSymbol;
        amount: Text;
    };
    
    public type ConversionResponse = {
        rate: Float;
        converted: Text;
        slippage: Float;
        estimatedGas: ?Text;
    };
    
    public type LiquidityPool = {
        id: Text;
        tokenA: TokenSymbol;
        tokenB: TokenSymbol;
        reserveA: Text;
        reserveB: Text;
        totalSupply: Text;
        fee: Float;
        createdAt: Int;
        isActive: Bool;
    };
    
    public type PoolPosition = {
        id: Text;
        poolId: Text;
        userEmail: Text;
        liquidity: Text;
        tokenAAmount: Text;
        tokenBAmount: Text;
        createdAt: Int;
    };
    
    public type SwapQuote = {
        inputAmount: Text;
        outputAmount: Text;
        priceImpact: Float;
        route: [TokenSymbol];
        minimumReceived: Text;
        fee: Text;
    };
    
    public type Error = {
        #InvalidToken;
        #InsufficientBalance;
        #InsufficientLiquidity;
        #InvalidAmount;
        #TransactionNotFound;
        #PoolNotFound;
        #Unauthorized;
        #InvalidRate;
        #SlippageTooHigh;
        #TransactionFailed;
        #InvalidPool;
    };
    
    // ===== STORAGE =====
    
    private stable var transactionEntries: [(Text, SwapTransaction)] = [];
    private stable var poolEntries: [(Text, LiquidityPool)] = [];
    private stable var positionEntries: [(Text, PoolPosition)] = [];
    private stable var tokenInfoEntries: [(TokenSymbol, TokenInfo)] = [];
    
    private var transactions = HashMap.HashMap<Text, SwapTransaction>(
        0, Text.equal, Text.hash
    );
    
    private var pools = HashMap.HashMap<Text, LiquidityPool>(
        0, Text.equal, Text.hash
    );
    
    private var positions = HashMap.HashMap<Text, PoolPosition>(
        0, Text.equal, Text.hash
    );
    
    private var tokenInfos = HashMap.HashMap<TokenSymbol, TokenInfo>(
        0, func(a, b) { a == b }, func(a) { 
            switch(a) {
                case (#ICP) 0;
                case (#ETH) 1;
                case (#BTC) 2;
                case (#EOS) 3;
                case (#USDC) 4;
                case (#USDT) 5;
            }
        }
    );
    
    // ===== INITIALIZATION =====
    
    system func preupgrade() {
        transactionEntries := Iter.toArray(transactions.entries());
        poolEntries := Iter.toArray(pools.entries());
        positionEntries := Iter.toArray(positions.entries());
        tokenInfoEntries := Iter.toArray(tokenInfos.entries());
    };
    
    system func postupgrade() {
        transactions := HashMap.fromIter<Text, SwapTransaction>(
            transactionEntries.vals(), transactionEntries.size(), Text.equal, Text.hash
        );
        pools := HashMap.fromIter<Text, LiquidityPool>(
            poolEntries.vals(), poolEntries.size(), Text.equal, Text.hash
        );
        positions := HashMap.fromIter<Text, PoolPosition>(
            positionEntries.vals(), positionEntries.size(), Text.equal, Text.hash
        );
        tokenInfos := HashMap.fromIter<TokenSymbol, TokenInfo>(
            tokenInfoEntries.vals(), tokenInfoEntries.size(), 
            func(a, b) { a == b }, 
            func(a) { 
                switch(a) {
                    case (#ICP) 0;
                    case (#ETH) 1;
                    case (#BTC) 2;
                    case (#EOS) 3;
                    case (#USDC) 4;
                    case (#USDT) 5;
                }
            }
        );
        transactionEntries := [];
        poolEntries := [];
        positionEntries := [];
        tokenInfoEntries := [];
        
        // Initialize default token info if not exists
        initializeDefaultTokens();
    };
    
    private func initializeDefaultTokens() {
        if (tokenInfos.size() == 0) {
            let defaultTokens: [(TokenSymbol, TokenInfo)] = [
                (#ICP, {
                    symbol = #ICP;
                    name = "Internet Computer";
                    decimals = 8;
                    canisterId = ?"rdmx6-jaaaa-aaaah-qcaiq-cai";
                    contractAddress = null;
                }),
                (#ETH, {
                    symbol = #ETH;
                    name = "Ethereum";
                    decimals = 18;
                    canisterId = null;
                    contractAddress = ?"0x0000000000000000000000000000000000000000";
                }),
                (#BTC, {
                    symbol = #BTC;
                    name = "Bitcoin";
                    decimals = 8;
                    canisterId = null;
                    contractAddress = null;
                }),
                (#EOS, {
                    symbol = #EOS;
                    name = "EOS";
                    decimals = 4;
                    canisterId = null;
                    contractAddress = null;
                }),
                (#USDC, {
                    symbol = #USDC;
                    name = "USD Coin";
                    decimals = 6;
                    canisterId = null;
                    contractAddress = ?"0xA0b86a33E6441c8C06DDD12336588bB064a117B3";
                }),
                (#USDT, {
                    symbol = #USDT;
                    name = "Tether USD";
                    decimals = 6;
                    canisterId = null;
                    contractAddress = ?"0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7";
                })
            ];
            
            for ((symbol, info) in defaultTokens.vals()) {
                tokenInfos.put(symbol, info);
            };
        };
    };
    
    // ===== UTILITY FUNCTIONS =====
    
    private func generateId(): Text {
        let time = Time.now();
        let random = time % 1000000;
        "tx_" # Nat.toText(Int.abs(time)) # "_" # Nat.toText(random)
    };
    
    private func generatePoolId(): Text {
        let time = Time.now();
        let random = time % 1000000;
        "pool_" # Nat.toText(Int.abs(time)) # "_" # Nat.toText(random)
    };
    
    private func generatePositionId(): Text {
        let time = Time.now();
        let random = time % 1000000;
        "pos_" # Nat.toText(Int.abs(time)) # "_" # Nat.toText(random)
    };
    
    private func parseFloat(text: Text): ?Float {
        switch (Float.fromText(text)) {
            case null { null };
            case (?f) { ?f };
        }
    };
    
    private func formatFloat(f: Float): Text {
        Float.format(#fix 6, f)
    };
    
    // ===== TOKEN MANAGEMENT =====
    
    public func getTokenInfo(symbol: TokenSymbol): async ?TokenInfo {
        tokenInfos.get(symbol)
    };
    
    public func getAllTokens(): async [(TokenSymbol, TokenInfo)] {
        Iter.toArray(tokenInfos.entries())
    };
    
    public func updateTokenInfo(symbol: TokenSymbol, info: TokenInfo): async Result.Result<(), Error> {
        tokenInfos.put(symbol, info);
        #ok(())
    };
    
    // ===== CONVERSION & PRICING =====
    
    // Mock price data - in production, this would fetch from external APIs
    private func getTokenPrice(symbol: TokenSymbol): Float {
        switch (symbol) {
            case (#ICP) 12.50;
            case (#ETH) 2500.0;
            case (#BTC) 45000.0;
            case (#EOS) 0.85;
            case (#USDC) 1.0;
            case (#USDT) 1.0;
        }
    };
    
    public func getConversionRate(from: TokenSymbol, to: TokenSymbol): async Result.Result<Float, Error> {
        if (from == to) {
            return #err(#InvalidToken);
        };
        
        let fromPrice = getTokenPrice(from);
        let toPrice = getTokenPrice(to);
        
        if (fromPrice == 0.0 or toPrice == 0.0) {
            return #err(#InvalidRate);
        };
        
        let rate = fromPrice / toPrice;
        #ok(rate)
    };
    
    public func convertCurrency(request: ConversionRequest): async Result.Result<ConversionResponse, Error> {
        switch (parseFloat(request.amount)) {
            case null { return #err(#InvalidAmount) };
            case (?amount) {
                if (amount <= 0.0) {
                    return #err(#InvalidAmount);
                };
                
                switch (await getConversionRate(request.from, request.to)) {
                    case (#err(error)) { #err(error) };
                    case (#ok(rate)) {
                        let converted = amount * rate;
                        let slippage = 0.5; // 0.5% slippage
                        let estimatedGas = if (request.from == #ETH or request.to == #ETH) {
                            ?"0.005"
                        } else {
                            null
                        };
                        
                        #ok({
                            rate = rate;
                            converted = formatFloat(converted);
                            slippage = slippage;
                            estimatedGas = estimatedGas;
                        })
                    };
                };
            };
        };
    };
    
    // ===== TRANSACTION MANAGEMENT =====
    
    public func createTransaction(
        from: TokenSymbol,
        to: TokenSymbol,
        amount: Text,
        converted: Text,
        rate: Float,
        userEmail: Text
    ): async Result.Result<SwapTransaction, Error> {
        let id = generateId();
        let now = Time.now();
        
        let transaction: SwapTransaction = {
            id = id;
            from = from;
            to = to;
            amount = amount;
            converted = converted;
            rate = rate;
            userEmail = userEmail;
            status = #pending;
            createdAt = now;
            updatedAt = now;
            txHash = null;
        };
        
        transactions.put(id, transaction);
        #ok(transaction)
    };
    
    public func getTransaction(id: Text): async ?SwapTransaction {
        transactions.get(id)
    };
    
    public func getUserTransactions(userEmail: Text): async [SwapTransaction] {
        let userTxs = Buffer.Buffer<SwapTransaction>(0);
        
        for ((_, tx) in transactions.entries()) {
            if (tx.userEmail == userEmail) {
                userTxs.add(tx);
            };
        };
        
        // Sort by creation time (newest first)
        let sorted = Buffer.toArray(userTxs);
        Array.sort(sorted, func(a: SwapTransaction, b: SwapTransaction): {#less; #equal; #greater} {
            if (a.createdAt > b.createdAt) { #less }
            else if (a.createdAt < b.createdAt) { #greater }
            else { #equal }
        });
        
        sorted
    };
    
    public func updateTransactionStatus(
        id: Text,
        status: TransactionStatus,
        txHash: ?Text
    ): async Result.Result<(), Error> {
        switch (transactions.get(id)) {
            case null { #err(#TransactionNotFound) };
            case (?tx) {
                let updatedTx = {
                    tx with
                    status = status;
                    updatedAt = Time.now();
                    txHash = txHash;
                };
                transactions.put(id, updatedTx);
                #ok(())
            };
        }
    };
    
    public func getTransactionsByStatus(status: TransactionStatus): async [SwapTransaction] {
        let filtered = Buffer.Buffer<SwapTransaction>(0);
        
        for ((_, tx) in transactions.entries()) {
            if (tx.status == status) {
                filtered.add(tx);
            };
        };
        
        Buffer.toArray(filtered)
    };
    
    // ===== LIQUIDITY POOL MANAGEMENT =====
    
    public func createPool(
        tokenA: TokenSymbol,
        tokenB: TokenSymbol,
        initialReserveA: Text,
        initialReserveB: Text,
        fee: Float
    ): async Result.Result<LiquidityPool, Error> {
        if (tokenA == tokenB) {
            return #err(#InvalidPool);
        };
        
        let id = generatePoolId();
        let now = Time.now();
        
        let pool: LiquidityPool = {
            id = id;
            tokenA = tokenA;
            tokenB = tokenB;
            reserveA = initialReserveA;
            reserveB = initialReserveB;
            totalSupply = "1000000"; // Initial supply
            fee = fee;
            createdAt = now;
            isActive = true;
        };
        
        pools.put(id, pool);
        #ok(pool)
    };
    
    public func getPool(id: Text): async ?LiquidityPool {
        pools.get(id)
    };
    
    public func getAllPools(): async [LiquidityPool] {
        Iter.toArray(pools.vals())
    };
    
    public func getActivePools(): async [LiquidityPool] {
        let active = Buffer.Buffer<LiquidityPool>(0);
        
        for ((_, pool) in pools.entries()) {
            if (pool.isActive) {
                active.add(pool);
            };
        };
        
        Buffer.toArray(active)
    };
    
    public func addLiquidity(
        poolId: Text,
        tokenAAmount: Text,
        tokenBAmount: Text,
        userEmail: Text
    ): async Result.Result<PoolPosition, Error> {
        switch (pools.get(poolId)) {
            case null { #err(#PoolNotFound) };
            case (?pool) {
                if (not pool.isActive) {
                    return #err(#InvalidPool);
                };
                
                let positionId = generatePositionId();
                let now = Time.now();
                
                // Calculate liquidity based on the smaller amount
                let liquidity = if (parseFloat(tokenAAmount) != null and parseFloat(tokenBAmount) != null) {
                    let amountA = Option.unwrap(parseFloat(tokenAAmount));
                    let amountB = Option.unwrap(parseFloat(tokenBAmount));
                    let reserveA = Option.unwrap(parseFloat(pool.reserveA));
                    let reserveB = Option.unwrap(parseFloat(pool.reserveB));
                    
                    if (reserveA == 0.0 or reserveB == 0.0) {
                        amountA // First liquidity
                    } else {
                        let liquidityA = (amountA * Option.unwrap(parseFloat(pool.totalSupply))) / reserveA;
                        let liquidityB = (amountB * Option.unwrap(parseFloat(pool.totalSupply))) / reserveB;
                        if (liquidityA < liquidityB) { liquidityA } else { liquidityB }
                    }
                } else {
                    return #err(#InvalidAmount);
                };
                
                let position: PoolPosition = {
                    id = positionId;
                    poolId = poolId;
                    userEmail = userEmail;
                    liquidity = formatFloat(liquidity);
                    tokenAAmount = tokenAAmount;
                    tokenBAmount = tokenBAmount;
                    createdAt = now;
                };
                
                positions.put(positionId, position);
                
                // Update pool reserves
                let newReserveA = if (parseFloat(pool.reserveA) != null and parseFloat(tokenAAmount) != null) {
                    formatFloat(Option.unwrap(parseFloat(pool.reserveA)) + Option.unwrap(parseFloat(tokenAAmount)))
                } else {
                    pool.reserveA
                };
                
                let newReserveB = if (parseFloat(pool.reserveB) != null and parseFloat(tokenBAmount) != null) {
                    formatFloat(Option.unwrap(parseFloat(pool.reserveB)) + Option.unwrap(parseFloat(tokenBAmount)))
                } else {
                    pool.reserveB
                };
                
                let newTotalSupply = if (parseFloat(pool.totalSupply) != null) {
                    formatFloat(Option.unwrap(parseFloat(pool.totalSupply)) + liquidity)
                } else {
                    pool.totalSupply
                };
                
                let updatedPool = {
                    pool with
                    reserveA = newReserveA;
                    reserveB = newReserveB;
                    totalSupply = newTotalSupply;
                };
                
                pools.put(poolId, updatedPool);
                #ok(position)
            };
        }
    };
    
    public func getUserPositions(userEmail: Text): async [PoolPosition] {
        let userPositions = Buffer.Buffer<PoolPosition>(0);
        
        for ((_, position) in positions.entries()) {
            if (position.userEmail == userEmail) {
                userPositions.add(position);
            };
        };
        
        Buffer.toArray(userPositions)
    };
    
    // ===== SWAP QUOTES =====
    
    public func getSwapQuote(
        tokenIn: TokenSymbol,
        tokenOut: TokenSymbol,
        amountIn: Text
    ): async Result.Result<SwapQuote, Error> {
        switch (parseFloat(amountIn)) {
            case null { return #err(#InvalidAmount) };
            case (?amount) {
                if (amount <= 0.0) {
                    return #err(#InvalidAmount);
                };
                
                // Find the best pool for this swap
                var bestPool: ?LiquidityPool = null;
                var bestOutput: Float = 0.0;
                
                for ((_, pool) in pools.entries()) {
                    if (pool.isActive and 
                        ((pool.tokenA == tokenIn and pool.tokenB == tokenOut) or
                         (pool.tokenA == tokenOut and pool.tokenB == tokenIn))) {
                        
                        let reserveIn = if (pool.tokenA == tokenIn) {
                            Option.unwrap(parseFloat(pool.reserveA))
                        } else {
                            Option.unwrap(parseFloat(pool.reserveB))
                        };
                        
                        let reserveOut = if (pool.tokenA == tokenOut) {
                            Option.unwrap(parseFloat(pool.reserveA))
                        } else {
                            Option.unwrap(parseFloat(pool.reserveB))
                        };
                        
                        if (reserveIn > 0.0 and reserveOut > 0.0) {
                            // Simple AMM calculation: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
                            let output = (amount * reserveOut) / (reserveIn + amount);
                            
                            if (output > bestOutput) {
                                bestOutput := output;
                                bestPool := ?pool;
                            };
                        };
                    };
                };
                
                switch (bestPool) {
                    case null { #err(#InsufficientLiquidity) };
                    case (?pool) {
                        let fee = (amount * pool.fee) / 100.0;
                        let amountAfterFee = amount - fee;
                        let finalOutput = (amountAfterFee * bestOutput) / amount;
                        
                        let priceImpact = if (bestOutput > 0.0) {
                            ((bestOutput - finalOutput) / bestOutput) * 100.0
                        } else {
                            0.0
                        };
                        
                        let minimumReceived = finalOutput * 0.95; // 5% slippage tolerance
                        
                        #ok({
                            inputAmount = amountIn;
                            outputAmount = formatFloat(finalOutput);
                            priceImpact = priceImpact;
                            route = [tokenIn, tokenOut];
                            minimumReceived = formatFloat(minimumReceived);
                            fee = formatFloat(fee);
                        })
                    };
                };
            };
        }
    };
    
    // ===== STATISTICS =====
    
    public func getSwapStats(): async {
        totalTransactions: Nat;
        totalVolume: Text;
        activePools: Nat;
        totalLiquidity: Text;
    } {
        let totalTxs = transactions.size();
        var totalVol: Float = 0.0;
        var activePoolCount = 0;
        var totalLiq: Float = 0.0;
        
        // Calculate total volume
        for ((_, tx) in transactions.entries()) {
            if (tx.status == #completed) {
                switch (parseFloat(tx.amount)) {
                    case (?amount) { totalVol += amount };
                    case null {};
                };
            };
        };
        
        // Count active pools and calculate total liquidity
        for ((_, pool) in pools.entries()) {
            if (pool.isActive) {
                activePoolCount += 1;
                switch (parseFloat(pool.reserveA)) {
                    case (?reserveA) { totalLiq += reserveA };
                    case null {};
                };
                switch (parseFloat(pool.reserveB)) {
                    case (?reserveB) { totalLiq += reserveB };
                    case null {};
                };
            };
        };
        
        {
            totalTransactions = totalTxs;
            totalVolume = formatFloat(totalVol);
            activePools = activePoolCount;
            totalLiquidity = formatFloat(totalLiq);
        }
    };
    
    // ===== ADMIN FUNCTIONS =====
    
    public func deactivatePool(poolId: Text): async Result.Result<(), Error> {
        switch (pools.get(poolId)) {
            case null { #err(#PoolNotFound) };
            case (?pool) {
                let updatedPool = { pool with isActive = false };
                pools.put(poolId, updatedPool);
                #ok(())
            };
        }
    };
    
    public func activatePool(poolId: Text): async Result.Result<(), Error> {
        switch (pools.get(poolId)) {
            case null { #err(#PoolNotFound) };
            case (?pool) {
                let updatedPool = { pool with isActive = true };
                pools.put(poolId, updatedPool);
                #ok(())
            };
        }
    };
}
