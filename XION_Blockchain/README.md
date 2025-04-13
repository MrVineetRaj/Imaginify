# XION blockchain for Imaginify

# Setup to deploy the code on XION

## OPTIMIZE_SMART_CONTRACT

```bash
docker run --rm -v "$(pwd)":/code \
    --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
    --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
   cosmwasm/optimizer:0.16.0
```

## Start the Xiond containor

```bash
docker run -ti -v "$(pwd)":/workspace burntnetwork/xion:latest /bin/bash
```

**Commands in container**

```bash
ls -la /workspace
cd /workspace
```

## XIOND key setup

```bash
xiond keys add my_wallet

# or

xiond keys add my_wallet  --recover
```

## Commands for XIOND Container

**Command 1**

```bash
RES=$(xiond tx wasm store ./artifacts/imaginify.wasm \
         --chain-id xion-testnet-2 \
         --gas-adjustment 1.3 \
         --gas-prices 0.1uxion \
         --gas auto \
         -y --output json \
         --node https://rpc.xion-testnet-2.burnt.com:443 \
         --from my_wallet)
```

```bash
echo $RES
```

**Output will be**

```json
{
  "height": "0",
  "txhash": "",
  "codespace": "",
  "code": 0,
  "data": "",
  "raw_log": "",
  "logs": [],
  "info": "",
  "gas_wanted": "0",
  "gas_used": "0",
  "tx": null,
  "timestamp": "",
  "events": []
}
```

**Store `txhash`**

```bash
TXHASH=""

```

---

**Command 2**

```bash
CODE_ID=$(xiond query tx $TXHASH \
    --node https://rpc.xion-testnet-2.burnt.com:443 \
    --output json | jq -r '.events[-1].attributes[1].value')

echo $CODE_ID #output = 819
```

---

**Command 3**

```bash
INIT_MSG='{"admin":"addr"}'
xiond tx wasm instantiate $CODE_ID "$INIT_MSG" \
      --label "Imaginify v1" \
      --chain-id xion-testnet-2 \
      --gas-adjustment 1.3 \
      --gas-prices 0.1uxion \
      --gas auto \
      --no-admin \
      -y --output json \
      --node https://rpc.xion-testnet-2.burnt.com:443 \
      --from my_wallet
```

**Output**

```bash
{"height":"0","txhash":"","codespace":"","code":0,"data":"","raw_log":"","logs":[],"info":"","gas_wanted":"0","gas_used":"0","tx":null,"timestamp":"","events":[]}

```

**store txhash**

```bash
TXHASH=""
```

---

**Command 4**

```bash
CONTRACT=$(xiond query tx $TXHASH \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  --output json | jq -r '.events[] | select(.type == "instantiate") | .attributes[] | select(.key == "_contract_address") | .value')
```

For this contract address

```bash
CONTRACT=""
```

---

# TEST_QUERIES

```bash
QUERY='{"get_config":{}}'
xiond query wasm contract-state smart "$CONTRACT" "$QUERY" \
        --node https://rpc.xion-testnet-2.burnt.com:443 \
        --output json
```

