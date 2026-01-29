import { useConnection, useEnsName } from "wagmi";
import { Login } from "../components/Login";
import { Leverage } from "../components/Leverage";
import { shorten } from "../utils/strings";

export function HomePage() {
  const { address } = useConnection();
  const { data: ensName } = useEnsName({ address });

  if (address === undefined) return <Login />;

  return (
    <>
      <h1>Hello, {ensName ?? shorten(address)}!</h1>
      <Leverage />
    </>
  );
}
