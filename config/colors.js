/**
 * ChainShop color tokens
 * -----------------------
 * Every color used across the app is defined here, once. Change a value
 * below and it updates everywhere the matching Tailwind class is used
 * (e.g. editing `seal.DEFAULT` changes every `bg-seal` / `text-seal` spot).
 *
 * Naming is by role, not by raw hue, so the meaning stays clear:
 *  - ink      -> text colors
 *  - paper    -> app background
 *  - surface  -> card / panel background
 *  - border   -> hairlines and dividers
 *  - seal     -> primary brand color, used for main actions (buy, pay, confirm)
 *  - ledger   -> secondary brand color, used for trust/success states
 *               (verified escrow, delivered, completed)
 *  - signal   -> reserved for blockchain-specific bits only (gas fee,
 *               wallet address, on-chain status) so they read as distinct
 *               from regular commerce UI
 *  - danger   -> destructive actions and errors (remove item, cancel)
 */

module.exports = {
  ink: {
    DEFAULT: "#14232E",
    soft: "#5E6E6A",
    faint: "#93A29D",
  },
  paper: "#EEF1EC",
  surface: "#FFFFFF",
  border: "#DCE3DC",

  seal: {
    DEFAULT: "#C1651C",
    dark: "#9C5015",
    soft: "#F4E4D3",
  },

  ledger: {
    DEFAULT: "#1F6F63",
    dark: "#175750",
    soft: "#DCEFEA",
  },

  signal: {
    DEFAULT: "#4B4FDB",
    dark: "#3A3EB8",
    soft: "#E7E7FB",
  },

  danger: {
    DEFAULT: "#C1443B",
    dark: "#9E362E",
    soft: "#F6DEDC",
  },
};
