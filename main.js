// ✅ QTX Token Launch - main.js (Browser-safe & Final)
import { Connection, clusterApiUrl, PublicKey } from "https://cdn.skypack.dev/@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "https://cdn.skypack.dev/@solana/spl-token";

const connectButton = document.getElementById("connectWallet");
const deployButton = document.getElementById("deployToken");
const statusDiv = document.getElementById("status");

let provider = null;
const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
const TOTAL_SUPPLY = 1_000_000_000 * 10 ** 9;

window.addEventListener("DOMContentLoaded", () => {
  if (window.solana && window.solana.isPhantom) {
    provider = window.solana;

    connectButton.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        connectButton.innerText = "Connected: " + resp.publicKey.toString().slice(0, 6) + "...";
        connectButton.disabled = true;
        deployButton.disabled = false;
        log("✅ Wallet connected");
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

        const founderAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          provider,
          mint,
          new PublicKey(FOUNDER_ADDRESS)
        );

        await mintTo(
          connection,
          provider,
          mint,
          founderAccount.address,
          provider.publicKey,
          TOTAL_SUPPLY
        );

        log(`✅ QTX Token Deployed: ${mint.toString()}`);
      } catch (err) {
        log("❌ Deployment failed: " + err.message);
        console.error(err);
      }
    });
  } else {
    log("❌ Phantom wallet not detected. Please install it.");
  }
});

function log(message) {
  statusDiv.innerText = message;
}
