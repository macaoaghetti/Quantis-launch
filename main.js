import {
  Connection,
  clusterApiUrl,
  PublicKey
} from "https://cdn.jsdelivr.net/npm/@solana/web3.js@1.73.3/+esm";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "https://cdn.jsdelivr.net/npm/@solana/spl-token@0.3.5/+esm";

const connectButton = document.getElementById("connectWallet");
const deployButton = document.getElementById("deployToken");
const statusDiv = document.getElementById("status");

let provider = null;
let wallet = null;

const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
const TOTAL_SUPPLY = 1_000_000_000 * 10 ** 9; // 1B QTX, 9 decimals
const FOUNDER_SUPPLY = TOTAL_SUPPLY * 0.15;  // 15% for founder

window.addEventListener("DOMContentLoaded", async () => {
  if (window.solana && window.solana.isPhantom) {
    provider = window.solana;
    log("✅ Phantom detected");

    connectButton.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        wallet = resp.publicKey.toString();
        connectButton.innerText = "Connected: " + wallet.slice(0, 6) + "...";
        connectButton.disabled = true;
        deployButton.disabled = false;
        log("✅ Wallet connected: " + wallet);
      } catch (err) {
        log("❌ Wallet connection failed: " + err.message);
      }
    });

    deployButton.addEventListener("click", async () => {
      try {
        const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

        const mint = await createMint(
          connection,
          provider,
          provider.publicKey,
          null,
          9
        );

        const founderTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          provider,
          mint,
          new PublicKey(FOUNDER_ADDRESS)
        );

        await mintTo(
          connection,
          provider,
          mint,
          founderTokenAccount.address,
          provider.publicKey,
          FOUNDER_SUPPLY
        );

        log(`✅ QTX Deployed! Mint Address:\n${mint.toString()}`);
      } catch (err) {
        log("❌ Deployment failed: " + err.message);
        console.error(err);
      }
    });
  } else {
    log("❌ Phantom Wallet not detected. Please install Phantom.");
  }
});

function log(message) {
  statusDiv.innerText = message;
  console.log(message);
}
