# Lemonade Crowdfund Subgraph

## Getting started

### Prerequisites
- Set up a [Studio](https://thegraph.com/studio/) on TheGraph
Follow [these steps](https://thegraph.com/docs/en/deploying/subgraph-studio/#how-to-create-a-subgraph-in-subgraph-studio) from TheGraph Official Documentation
- Install Graph CLI by doing `yarn global add @graphprotocol/graph-cli`

### Quick start
2. `yarn` to install dependencies
3. `graph auth --studio <STUDIO_DEPLOY_KEY>` to sign in to The Graph Studio
4. `yarn codegen && yarn build` to generate code from schema and contract ABIs to finally make deployment builds
5. `yarn deploy` to deploy the subgraph to the previously created Studio. **Optional**: switch networks by specifying `--network <network_name_in_networks.json>`
