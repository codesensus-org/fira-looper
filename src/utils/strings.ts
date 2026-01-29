import { Address, zeroAddress } from "viem";

const CUSTOM_NAMES: Partial<Record<Address, string>> = {
  [zeroAddress]: "",
  "0x73a15fed60bf67631dc6cd7bc5b6e8da8190acf5": "USD0",
  "0x35d8949372d46b7a3d5a56006ae77b215fc69bc0": "bUSD0",
};

export function shorten(address: Address) {
  return (
    CUSTOM_NAMES[address.toLowerCase() as Address] ??
    address.replace(/^(0x\w{3})(?:\w{34}|\w{58})(\w{3})$/, "$1•••$2")
  );
}
