// main.js
import { Connection, clusterApiUrl, PublicKey } from "https://cdn.jsdelivr.net/npm/@solana/web3.js@1.73.3/+esm";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "https://cdn.jsdelivr.net/npm/@solana/spl-token@0.3.5/+esm";

const connectButton = document.getElementById("connectWallet");
const deployButton  = document.getElementById("deployToken");
const statusDiv     = document.getElementById("status");

const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
const TOTAL_SUPPLY    = 1_000_000_000 * 10 ** 9;    // 1B tokens (9 decimals)
const FOUNDER_SUPPLY  = Math.floor(TOTAL_SUPPLY * 0.15); // 15% to founder

let provider = null;

window.addEventListener("DOMContentLoaded", () => {
  if (window.solana && window.solana.isPhantom) {
    provider = window.solana;
    log("✅ Phantom detected");

    connectButton.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        const walletPub = resp.publicKey.toString();
        connectButton.innerText = `Connected: ${walletPub.slice(0,6)}...`;
        connectButton.disabled = true;
        deployButton.disabled = false;
        log(`✅ Wallet connected: ${walletPub}`);
      } catch (err) {
        log(`❌ Connection failed: ${err.message}`);
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

        const founderATA = await getOrCreateAssociatedTokenAccount(
          connection,
          provider,
          mint,
          new PublicKey(FOUNDER_ADDRESS)
        );

        await mintTo(
          connection,
          provider,
          mint,
          founderATA.address,
          provider.publicKey,
          FOUNDER_SUPPLY
        );

        log(`✅ QTX Deployed! Mint: ${mint.toString()}`);
      } catch (err) {
        log(`❌ Deployment failed: ${err.message}`);
        console.error(err);
      }
    });
  } else {
    log("❌ Phantom not detected. Please install Phantom.");
  }
});

function log(message) {
  statusDiv.innerText = message;
  console.log(message);
}
