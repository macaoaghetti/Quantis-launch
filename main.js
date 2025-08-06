document.addEventListener("DOMContentLoaded", async function () {
  const splToken = window.splToken;
  const connectButton = document.getElementById("connectWallet");
  const deployButton = document.getElementById("deployToken");
  const statusDiv = document.getElementById("status");

  let provider = null;
  let wallet = null;

  const TOTAL_SUPPLY = 1_000_000_000 * 10 ** 9; // 1 billion QTX with 9 decimals

  if (window.solana && window.solana.isPhantom) {
    provider = window.solana;

    connectButton.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        wallet = resp.publicKey.toString();
        connectButton.innerText = "Connected: " + wallet.slice(0, 6) + "...";
        connectButton.disabled = true;
        deployButton.disabled = false;
      } catch (err) {
        console.error("Wallet connection failed:", err);
        statusDiv.innerText = "❌ Wallet connection failed.";
      }
    });

    deployButton.addEventListener("click", async () => {
      try {
        statusDiv.innerText = "⏳ Deploying QTX Token...";
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed");

        const mint = await splToken.createMint(
          connection,
          provider, // payer
          provider.publicKey, // mintAuthority
          null,
          9
        );

        const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
          connection,
          provider,
          mint,
          provider.publicKey
        );

        await splToken.mintTo(
          connection,
          provider,
          mint,
          tokenAccount.address,
          provider.publicKey,
          TOTAL_SUPPLY
        );

        statusDiv.innerText = "✅ QTX Token Deployed: " + mint.toBase58();
      } catch (err) {
        console.error("Deployment failed:", err);
        statusDiv.innerText = "❌ Deployment failed. Check console.";
      }
    });
  } else {
    alert("Phantom wallet not found. Please install it.");
  }
});
