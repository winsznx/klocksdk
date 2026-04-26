# klocksdk

A professional, class-based TypeScript SDK for the Klock smart contract on Stacks.

## Installation

```bash
npm install @winsznx/klocksdk
```

## Quick Start

```typescript
import { KlockClient } from '@winsznx/klocksdk';

async function main() {
  const client = new KlockClient({
    contractAddress: 'SP123...',
    contractName: 'klock-contract',
    network: 'mainnet'
  });

  // Get raw state
  const rawState = await client.getRawState();
  console.log('Raw State:', rawState);

  // Get live computed state
  const liveState = await client.getLiveState();
  console.log('Live State:', liveState);
}
main();
```
