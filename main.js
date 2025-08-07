import {
  Connection,
  PublicKey
} from "https://esm.sh/@solana/web3.js@1.73.3";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "https://esm.sh/@solana/spl-token@0.3.5";

// ── CONFIG ────────────────────────────────────────────────────────────────────

// your QuickNode HTTP URL (Solana Mainnet)
const RPC_URL =
  "https://wiser-cool-arm.solana-mainnet.quiknode.pro/cdc6f37839abfb551f2c762094e0b05dcc5aa93a/";
const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";

// total supply = 1 000 000 000 × 10⁹
const TOTAL_SUPPLY   = 1_000_000_000 * 10 ** 9;
// 15% to the founder
const FOUNDER_SUPPLY = Math.floor(TOTAL_SUPPLY * 0.15);

// ── UI HOOKS ─────────────────────────────────────────────────────────────────

const connectBtn = document.getElementById("connectWallet");
const deployBtn  = document.getElementById("deployToken");
const statusDiv  = document.getElementById("status");

// ── STATE ─────────────────────────────────────────────────────────────────────

let provider     = null;
let walletPubkey = null;

// ── BOOTSTRAP ─────────────────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {
  statusDiv.innerText = "Status: checking Phantom…";

  if (window.solana?.isPhantom) {
    provider = window.solana;
    statusDiv.innerText = "Status: Phantom detected";
    connectBtn.disabled = false;

    connectBtn.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        // if resp.publicKey missing, fall back to provider.publicKey
        walletPubkey = resp?.publicKey || provider.publicKey;

        // DEBUG: uncomment to inspect the object
        // console.log({ resp, fallback: provider.publicKey });

        connectBtn.innerText = "🔒 " +
          walletPubkey.toString().slice(0, 6) + "...";
        connectBtn.disabled = true;
        deployBtn.disabled  = false;
        statusDiv.innerText = "Status: Wallet connected";
      } catch (err) {
        statusDiv.innerText = "❌ Connect failed: " + err.message;
      }
    });

    deployBtn.addEventListener("click", async () => {
      if (!walletPubkey) {
        statusDiv.innerText = "❌ Please connect your wallet first";
        return;
      }

      statusDiv.innerText = "Status: deploying token…";
      deployBtn.disabled  = true;

      try {
        const conn = new Connection(RPC_URL, "confirmed");

        // 1) create the mint
        const mint = await createMint(
          conn,
          provider,       // payer
          walletPubkey,   // mint authority
          null,           // freeze authority
          9               // decimals
        );

        // 2) get founder ATA
        const ata = await getOrCreateAssociatedTokenAccount(
          conn,
          provider,
          mint,
          new PublicKey(FOUNDER_ADDRESS)
        );

        // 3) mint founder supply
        await mintTo(
          conn,
          provider,
          mint,
          ata.address,
          walletPubkey,
          FOUNDER_SUPPLY
        );

        statusDiv.innerText = "✅ Deployed! Mint: " + mint.toString();
      } catch (err) {
        statusDiv.innerText = "❌ Deploy failed: " + err.message;
      } finally {
        deployBtn.disabled = false;
      }
    });

  } else {
    statusDiv.innerText =
      "❌ Phantom not found. Please install the Phantom extension.";
  }
});
