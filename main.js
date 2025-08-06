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
        const connection = new solanaWeb3.Connection(
          solanaWeb3.clusterApiUrl("devnet"),
          "confirmed"
        );

        const walletPublicKey = provider.publicKey;

        // Wrap Phantom provider as a signer
        const payer = {
          publicKey: walletPublicKey,
          signTransaction: provider.signTransaction.bind(provider),
          signAllTransactions: provider.signAllTransactions.bind(provider),
        };

        // Create Mint
        const mint = await splToken.createMint(
          connection,
          payer,
          walletPublicKey,
          null,
          9
        );

        // Create Token Account
        const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mint,
          walletPublicKey
        );

        // Mint tokens
        await splToken.mintTo(
          connection,
          payer,
          mint,
          tokenAccount.address,
          walletPublicKey,
          TOTAL_SUPPLY
        );

        statusDiv.innerText =
          "✅ QTX Token Deployed: " + mint
