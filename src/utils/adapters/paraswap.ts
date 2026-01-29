export const PARASWAP_ADAPTER =
  "0x03b5259Bd204BfD4A616E5B79b0B786d90c6C38f" as const;

export const paraswapAdapterAbi = [
  {
    inputs: [
      { internalType: "address", name: "bundler3", type: "address" },
      { internalType: "address", name: "morpho", type: "address" },
      { internalType: "address", name: "augustusRegistry", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AdapterAddress", type: "error" },
  { inputs: [], name: "BuyAmountTooLow", type: "error" },
  { inputs: [], name: "FailedCall", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "InsufficientBalance",
    type: "error",
  },
  { inputs: [], name: "InvalidAugustus", type: "error" },
  { inputs: [], name: "InvalidOffset", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  { inputs: [], name: "SellAmountTooHigh", type: "error" },
  { inputs: [], name: "UnauthorizedSender", type: "error" },
  { inputs: [], name: "ZeroAddress", type: "error" },
  { inputs: [], name: "ZeroAmount", type: "error" },
  {
    inputs: [],
    name: "AUGUSTUS_REGISTRY",
    outputs: [
      { internalType: "contract IAugustusRegistry", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "BUNDLER3",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MORPHO",
    outputs: [{ internalType: "contract IMorpho", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "augustus", type: "address" },
      { internalType: "bytes", name: "callData", type: "bytes" },
      { internalType: "address", name: "srcToken", type: "address" },
      { internalType: "address", name: "destToken", type: "address" },
      { internalType: "uint256", name: "newDestAmount", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "exactAmount", type: "uint256" },
          { internalType: "uint256", name: "limitAmount", type: "uint256" },
          { internalType: "uint256", name: "quotedAmount", type: "uint256" },
        ],
        internalType: "struct Offsets",
        name: "offsets",
        type: "tuple",
      },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "augustus", type: "address" },
      { internalType: "bytes", name: "callData", type: "bytes" },
      { internalType: "address", name: "srcToken", type: "address" },
      {
        components: [
          { internalType: "address", name: "loanToken", type: "address" },
          { internalType: "address", name: "collateralToken", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "address", name: "irm", type: "address" },
          { internalType: "uint256", name: "lltv", type: "uint256" },
        ],
        internalType: "struct MarketParams",
        name: "marketParams",
        type: "tuple",
      },
      {
        components: [
          { internalType: "uint256", name: "exactAmount", type: "uint256" },
          { internalType: "uint256", name: "limitAmount", type: "uint256" },
          { internalType: "uint256", name: "quotedAmount", type: "uint256" },
        ],
        internalType: "struct Offsets",
        name: "offsets",
        type: "tuple",
      },
      { internalType: "address", name: "onBehalf", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "buyMorphoDebt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "erc20Transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "nativeTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "augustus", type: "address" },
      { internalType: "bytes", name: "callData", type: "bytes" },
      { internalType: "address", name: "srcToken", type: "address" },
      { internalType: "address", name: "destToken", type: "address" },
      { internalType: "bool", name: "sellEntireBalance", type: "bool" },
      {
        components: [
          { internalType: "uint256", name: "exactAmount", type: "uint256" },
          { internalType: "uint256", name: "limitAmount", type: "uint256" },
          { internalType: "uint256", name: "quotedAmount", type: "uint256" },
        ],
        internalType: "struct Offsets",
        name: "offsets",
        type: "tuple",
      },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "sell",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const;
