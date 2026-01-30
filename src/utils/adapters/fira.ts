export const FIRA_ADAPTER =
  "0x038B2F84194dA7108eE7e75f012e031e8551291B" as const;

export const firaAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "bundler3",
        type: "address",
        internalType: "address",
      },
      {
        name: "lendingMarket",
        type: "address",
        internalType: "address",
      },
      {
        name: "paraswapAdapter",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "BUNDLER3",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "LENDING_MARKET",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IFiraLendingMarket",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "PARASWAP_ADAPTER",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IParaswapAdapter",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "buyFiraDebt",
    inputs: [
      {
        name: "augustus",
        type: "address",
        internalType: "address",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "srcToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "marketParams",
        type: "tuple",
        internalType: "struct MarketParams",
        components: [
          {
            name: "loanToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "irm",
            type: "address",
            internalType: "address",
          },
          {
            name: "ltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "whitelist",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "offsets",
        type: "tuple",
        internalType: "struct Offsets",
        components: [
          {
            name: "exactAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "limitAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "quotedAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "onBehalf",
        type: "address",
        internalType: "address",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "erc20Transfer",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "firaBorrow",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        internalType: "struct MarketParams",
        components: [
          {
            name: "loanToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "irm",
            type: "address",
            internalType: "address",
          },
          {
            name: "ltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "whitelist",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "assets",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "shares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minSharePriceE27",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "firaFlashLoan",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "assets",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "firaRepay",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        internalType: "struct MarketParams",
        components: [
          {
            name: "loanToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "irm",
            type: "address",
            internalType: "address",
          },
          {
            name: "ltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "whitelist",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "assets",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "shares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxSharePriceE27",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "onBehalf",
        type: "address",
        internalType: "address",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "firaSupply",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        internalType: "struct MarketParams",
        components: [
          {
            name: "loanToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "irm",
            type: "address",
            internalType: "address",
          },
          {
            name: "ltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "whitelist",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "assets",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "shares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxSharePriceE27",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "onBehalf",
        type: "address",
        internalType: "address",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "firaSupplyCollateral",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        internalType: "struct MarketParams",
        components: [
          {
            name: "loanToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "irm",
            type: "address",
            internalType: "address",
          },
          {
            name: "ltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "whitelist",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "assets",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "onBehalf",
        type: "address",
        internalType: "address",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "firaWithdraw",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        internalType: "struct MarketParams",
        components: [
          {
            name: "loanToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "irm",
            type: "address",
            internalType: "address",
          },
          {
            name: "ltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "whitelist",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "assets",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "shares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minSharePriceE27",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "firaWithdrawCollateral",
    inputs: [
      {
        name: "marketParams",
        type: "tuple",
        internalType: "struct MarketParams",
        components: [
          {
            name: "loanToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "collateralToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "irm",
            type: "address",
            internalType: "address",
          },
          {
            name: "ltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lltv",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "whitelist",
            type: "address",
            internalType: "address",
          },
        ],
      },
      {
        name: "assets",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nativeTransfer",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onFlashLoan",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onRepay",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onSupply",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onSupplyCollateral",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    name: "AdapterAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: [
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "needed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "SlippageExceeded",
    inputs: [],
  },
  {
    type: "error",
    name: "UnauthorizedSender",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAmount",
    inputs: [],
  },
] as const;
