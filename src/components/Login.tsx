import { useConnect, useConnectors } from "wagmi";

export function Login() {
  const connectors = useConnectors();
  const { mutate: connect } = useConnect();

  return (
    <>
      <h1>Please login</h1>
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
    </>
  );
}
