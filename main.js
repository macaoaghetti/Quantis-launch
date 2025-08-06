import {
  Connection,
  clusterApiUrl,
  PublicKey
} from "https://unpkg.com/@solana/web3.js@1.73.2/lib/index.esm.js";

import {
  getOrCreateAssociatedTokenAccount,
  createMint,
  mintTo
} from "https://cdn.jsdelivr.net/npm/@solana/spl-token@0.3.5/lib/index.esm.js";

document.addEventListener("DOMContentLoaded", async function () {
  const connectButton = document.getElementById("connectWallet");
  const deployButton = document.getElementById("deployToken");
  const statusDiv = document.getElementById("status");

  const TOTAL_SUPPLY = 1_000_000_000 * 10 ** 9;

  if (!window.solana || !window.solana.isPhantom) {
    alert("Phantom wallet not found. Please install it.");
    return;
  }

  const provider = window.solana;

  connectButton.addEventListener("click", async () => {
    try {
      const resp = await provider.connect();
      const walletPub = resp.publicKey.toString();
      connectButton.innerText = "Connected: " + walletPub.slice(0, 6) + "...";
      connectButton.disabled = true;
      deployButton.disabled = false;
    } catch (err) {
      console.error("Wallet connection failed:", err);
      statusDiv.innerText = "❌ Wallet connect failed.";
    }
  });

  deployButton.addEventListener("click", async () => {
    try {
      statusDiv.innerText = "⏳ Deploying QTX Token...";

      const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
      const walletPubKey = provider.publicKey;

      const payer = {
        publicKey: walletPubKey,
        signTransaction: provider.signTransaction.bind(provider),
        signAllTransactions: provider.signAllTransactions.bind(provider),
      };

      const mint = await createMint(
        connection,
        payer,
        walletPubKey,
        null,
        9
      );

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        walletPubKey
      );

      await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        walletPubKey,
        TOTAL_SUPPLY
      );

      statusDiv.innerText = "✅ QTX Deployed: " + mint.toBase58();
    } catch (err) {
      console.error("Deployment failed:", err);
      statusDiv.innerText = "❌ Deployment failed. Check console.";
    }
  });
});
