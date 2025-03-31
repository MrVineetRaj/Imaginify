# Imaginify: AI Credits Management System


1. **Query Contract Config**:

   ```bash
   QUERY_CONFIG='{"get_config":{}}'
   xiond query wasm contract-state smart "$CONTRACT" "$QUERY_CONFIG" \
         --node https://rpc.xion-testnet-2.burnt.com:443 \
         --output json
   ```

2. **Register as User**:

   ```bash
   REG_USER_MSG='{"register_user":{}}'
   xiond tx wasm execute "$CONTRACT" "$REG_USER_MSG" \
         --chain-id xion-testnet-2 \
         --gas-adjustment 1.3 \
         --gas-prices 0.1uxion \
         --gas auto \
         -y --output json \
         --node https://rpc.xion-testnet-2.burnt.com:443 \
         --from my_wallet
   ```

3. **Buy Credits**:

   ```bash
   BUY_CREDITS_MSG='{"buy_credits":{"bundle":"Basic"}}'
   xiond tx wasm execute $CONTRACT_ADDR "$BUY_CREDITS_MSG" \
         --chain-id xion-testnet-2 \
         --gas-adjustment 1.3 \
         --gas-prices 0.1uxion \
         --gas auto \
         --amount 10000uxion \
         -y --output json \
         --node https://rpc.xion-testnet-2.burnt.com:443 \
         --from my_wallet
   ```

4. **Use Credits**:
   ```bash
   USE_CREDITS_MSG='{"use_credits":{"credits":1}}'
   xiond tx wasm execute $CONTRACT_ADDR "$USE_CREDITS_MSG" \
         --chain-id xion-testnet-2 \
         --gas-adjustment 1.3 \
         --gas-prices 0.1uxion \
         --gas auto \
         -y --output json \
         --node https://rpc.xion-testnet-2.burnt.com:443 \
         --from my_wallet
   ```

