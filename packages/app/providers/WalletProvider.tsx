import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as bip39 from "bip39";
import bs58 from "bs58";

import * as SecureStore from "expo-secure-store";
import { Connection, clusterApiUrl, PublicKey, Transaction, SystemProgram, Keypair, sendAndConfirmTransaction, Signer, TransactionInstruction, ComputeBudgetProgram, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { useMe } from "./MeProvider";
import {
  createInitializeMint2Instruction,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToCheckedInstruction,
  createTransferCheckedInstruction
} from "@solana/spl-token";

export interface Wallet {
  address: string;
  seed: string | null;
  cloudBackupAt: Date | null;
  localBackupAt: Date | null;
}

interface WalletContextProps {
  isLoading: boolean;
  wallet: Wallet | undefined;
  create: (mnemonic?: string) => Promise<Wallet>;
  update: (options: { local?: boolean; cloud?: boolean }) => void;
  store: (wallet: Wallet) => Promise<void>;
  sign: (message: string) => Promise<string>;
  clear: () => Promise<void>;
  getTransactions: () => Promise<any[]>;
  send: (recipientAddress: string, amountSol: number) => Promise<string>;
  estimateTransactionCost: (recipientAddress: string, amountSol: number) => Promise<string>;
  mintAndTransferToken: (
    recipientAddress: string,
    totalAmount: number,
    transferAmount: number,
    decimals?: number
  ) => Promise<string>;
  transactions: any[];
  convertSolToUSD: (amount: number) => Promise<string>;
  convertUSDToSol: (amount: number) => Promise<string>;

}

export function getSolanaConnection() {
  const network =
    process.env.NODE_ENV === "production"
      ? "mainnet-beta"
      : "devnet";

  return new Connection(clusterApiUrl(network), "confirmed");
}
const WalletContext = createContext<WalletContextProps>({
  isLoading: true,
  wallet: undefined,
  create: () => {
    throw new Error("wallet_not_ready");
  },
  update: () => {
    throw new Error("wallet_not_ready");
  },
  store: () => {
    throw new Error("wallet_not_ready");
  },
  sign: () => {
    throw new Error("wallet_not_ready");
  },
  clear: () => {
    throw new Error("wallet_not_ready");
  },
  getTransactions: () => {
    throw new Error("wallet_not_ready");
  },
  send: () => {
    throw new Error("wallet_not_ready");
  },
  estimateTransactionCost: () => {
    throw new Error("wallet_not_ready");
  },
  mintAndTransferToken: () => {
    throw new Error("wallet_not_ready");
  },
  transactions: [],
  convertSolToUSD: () => {
    throw new Error("wallet_not_ready");
  },
  convertUSDToSol: () => {
    throw new Error("wallet_not_ready");
  },
});

export function useWallet(): WalletContextProps {
  const value = useContext(WalletContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useWallet must be wrapped in a <WalletProvider />");
    }
  }

  return value;
}

interface Props extends PropsWithChildren { }

async function getSigner(seedphrase: string) {
  const seed = bip39.mnemonicToSeedSync(seedphrase, "");
  return Keypair.fromSeed(seed.subarray(0, 32));
}

export function WalletProvider({ children }: Props) {
  const { me } = useMe();
  const [wallet, setWallet] = useState<Wallet>();
  const [signer, setSigner] = useState<Signer>();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [solPriceUSD, setSolPriceUSD] = useState<number>(0);



  const getTransactions = useCallback(async (): Promise<any[]> => {
    if (!wallet?.address) throw new Error("No wallet address");

    console.log("Fetching transactions for:", wallet.address);

    const publicKey = new PublicKey(wallet.address);
    const connection = getSolanaConnection();


    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
        });

        if (!tx) return null;

        return {
          signature: sig.signature,
          date: tx.blockTime
            ? new Date(tx.blockTime * 1000).toISOString().split("T")[0]
            : null,
          time: tx.blockTime
            ? new Date(tx.blockTime * 1000).toLocaleTimeString("en-US", { hour12: true })
            : null,
          fee: tx.meta?.fee ? tx.meta.fee / 1_000_000_000 : 0,
          status: tx.meta?.err ? "failed" : "success",
          type: tx.transaction.message.instructions.some((ix: any) =>
            ix.program === "system" &&
            ix.parsed?.type === "transfer" &&
            ix.parsed?.info?.source === wallet.address
          )
            ? "send"
            : "receive",
          instructions: tx.transaction.message.instructions.map((ix: any) => {
            if (ix.parsed) {
              return {
                type: ix.parsed.type,
                info: ix.parsed.info,
              };
            }
            return {
              type: "raw",
              programId: ix.programId.toBase58(),
            };
          }),
        };
      })
    );

    const filteredTx = transactions.filter(Boolean) as any[];
    setTransactions(filteredTx);
    return filteredTx;
  }, [wallet]);


  useEffect(() => {
    setIsLoading(true);
    SecureStore.getItemAsync(me.id)
      .then((walletStr) => {
        if (!walletStr) {
          return;
        }

        const wallet: Wallet = JSON.parse(walletStr);
        setWallet(wallet);
        if (wallet.seed) {
          getSigner(wallet.seed).then(setSigner).catch(console.error);
        }
      })
      .finally(() => setIsLoading(false));
  }, [me]);


  function createMemoInstruction(message: string, signer: PublicKey) {
    return new TransactionInstruction({
      keys: [{ pubkey: signer, isSigner: true, isWritable: true }],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(message, "utf8"),
    });
  }

  const send = async (toAddress: string, amountSol: number): Promise<string> => {
    if (!wallet) {
      throw new Error('missing_wallet');
    }
    if (!signer) {
      throw new Error('missing_signer');
    }

    const connection = getSolanaConnection();


    const from = new PublicKey(wallet.address);
    const to = new PublicKey(toAddress);

    const LAMPORTS_PER_SOL = 1_000_000_000;
    const transferAmount = amountSol * LAMPORTS_PER_SOL;
    console.log("Transfer amount (lamports):", transferAmount);

    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: transferAmount
      })
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transferTransaction,
      [signer]
    );
    console.log("Transaction Signature:", signature);

    return signature;
  };
  const estimateTransactionCost = useCallback(
    async (recipientAddress: string, amountSol: number) => {
      if (!wallet) throw new Error("missing_wallet");
      if (!signer) throw new Error("missing_signer");

      const connection = getSolanaConnection();

      const { blockhash } = await connection.getLatestBlockhash();

      const from = new PublicKey(wallet.address);
      const to = new PublicKey(recipientAddress);

      const LAMPORTS_PER_SOL = 1_000_000_000;
      const lamports = amountSol * LAMPORTS_PER_SOL;

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports,
      });

      const simulationInstructions = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1n }),
        transferInstruction,
      ];

      const simulationTransaction = new VersionedTransaction(
        new TransactionMessage({
          instructions: simulationInstructions,
          payerKey: from,
          recentBlockhash: blockhash,
        }).compileToV0Message()
      );

      const simulationResponse = await connection.simulateTransaction(simulationTransaction);
      const estimatedUnits = simulationResponse.value.unitsConsumed ?? 0;

      const computeUnitLimitInstruction =
        ComputeBudgetProgram.setComputeUnitLimit({ units: estimatedUnits });

      const computeUnitPriceInstruction =
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1n });

      const messageV0 = new TransactionMessage({
        payerKey: from,
        recentBlockhash: blockhash,
        instructions: [
          computeUnitPriceInstruction,
          computeUnitLimitInstruction,
          transferInstruction,
        ],
      }).compileToV0Message();

      const fees = await connection.getFeeForMessage(messageV0);
      console.log("fees ------------------------", fees)
      return fees.value ? fees.value / LAMPORTS_PER_SOL : 0;
    },
    [wallet, signer]
  );
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        const data = await res.json();
        setSolPriceUSD(data.solana?.usd ?? 0);
      } catch (error) {
        console.error("Failed to fetch SOL price:", error);
        setSolPriceUSD(0);
      }
    };

    fetchSolPrice();
  }, []);

  const convertSolToUSD = useCallback((amountSol: number) => {
    return amountSol * solPriceUSD;
  }, [solPriceUSD]);

  const convertUSDToSol = useCallback((amountUSD: number) => {
    if (solPriceUSD === 0) return 0;
    return amountUSD / solPriceUSD;
  }, [solPriceUSD]);


  const clear = useCallback(async () => {
    await SecureStore.deleteItemAsync(me.id);
    setWallet(undefined);
    setSigner(undefined);
  }, [me]);




  const store = useCallback(
    async (wallet: Wallet) => {
      if (wallet.seed) {
        // This makes sure we update the UI with any loading stuff since this operation might take a while
        await new Promise<void>((res) => setTimeout(res, 1));

        const signer = await getSigner(wallet.seed);
        if (!signer) {
          throw new Error('missing_signer');
        }
        setSigner(signer);
      } else {
        setSigner(undefined);
      }

      await SecureStore.setItemAsync(me.id, JSON.stringify(wallet));
      setWallet(wallet);
    },
    [me]
  );

  const create = useCallback(async (mnemonic?: string) => {
    // This makes sure we update the UI with any loading stuff since this operation might take a while
    await new Promise<void>((res) => setTimeout(res, 1));

    const phrase = mnemonic ?? bip39.generateMnemonic();
    const signer = await getSigner(phrase);
    const wallet: Wallet = {
      address: signer.publicKey.toBase58(),
      seed: phrase,
      localBackupAt: null,
      cloudBackupAt: null,
    };
    return wallet;
  }, []);

  const sign = useCallback(
    async (message: string): Promise<string> => {
      if (!signer) throw new Error("no_signer");

      const connection = getSolanaConnection();
      if (!wallet?.address) throw new Error("No wallet address");

      const tx = new Transaction().add(
        createMemoInstruction(message, new PublicKey(wallet.address))
      );

      tx.feePayer = new PublicKey(wallet.address);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      tx.sign(signer as any);

      return bs58.encode(tx.serialize());
    },
    [signer, wallet]
  );


  const mintAndTransferToken = async (
    recipientAddress: string,
    totalAmount: number,
    transferAmount: number,
    decimals = 9
  ): Promise<string> => {
    try {
      console.log("mintAndTransferToken started");

      if (!wallet) throw new Error("missing_wallet");
      if (!signer) throw new Error("missing_signer");

      const connection = getSolanaConnection();
      console.log("Connection to devnet established");

      const mint = Keypair.generate();
      console.log("New mint account generated:", mint.publicKey.toBase58());

      const fromPubkey = new PublicKey(wallet.address);
      const toPubkey = new PublicKey(recipientAddress);
      console.log("From pubkey:", fromPubkey.toBase58());
      console.log("To pubkey:", toPubkey.toBase58());

      const mintLen = getMintLen([]);
      console.log("Mint length (space needed):", mintLen);

      const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
      console.log("Minimum lamports for rent exemption:", lamports);

      const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      });
      console.log("Created mint account instruction");

      const initializeMintIx = createInitializeMint2Instruction(
        mint.publicKey,
        decimals,
        fromPubkey,
        null,
        TOKEN_2022_PROGRAM_ID
      );
      console.log("Created initialize mint instruction");

      const fromTokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        fromPubkey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      console.log("From token account address:", fromTokenAccount.toBase58());

      const toTokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        toPubkey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      console.log("To token account address:", toTokenAccount.toBase58());

      const createFromAtaIx = createAssociatedTokenAccountInstruction(
        fromPubkey,
        fromTokenAccount,
        fromPubkey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
      );
      console.log("Created from token account ATA instruction");

      const createToAtaIx = createAssociatedTokenAccountInstruction(
        fromPubkey,
        toTokenAccount,
        toPubkey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
      );
      console.log("Created to token account ATA instruction");

      const mintToIx = createMintToCheckedInstruction(
        mint.publicKey,
        fromTokenAccount,
        fromPubkey,
        totalAmount * 10 ** decimals,
        decimals,
        [],
        TOKEN_2022_PROGRAM_ID
      );
      console.log(
        `Created mintToChecked instruction to mint ${totalAmount} tokens`
      );

      // Step 1: Create mint, ATAs, and mint tokens
      const setupTx = new Transaction().add(
        createMintAccountIx,
        initializeMintIx,
        createFromAtaIx,
        createToAtaIx,
        mintToIx
      );
      console.log("Sending setup transaction...");
      await sendAndConfirmTransaction(connection, setupTx, [signer, mint], {
        commitment: "confirmed",
      });
      console.log("Setup transaction confirmed");

      // Step 2: Transfer part of the tokens
      const transferIx = createTransferCheckedInstruction(
        fromTokenAccount,
        mint.publicKey,
        toTokenAccount,
        fromPubkey,
        transferAmount * 10 ** decimals,
        decimals,
        [],
        TOKEN_2022_PROGRAM_ID
      );
      console.log(
        `Created transferChecked instruction to transfer ${transferAmount} tokens`
      );

      const transferTx = new Transaction().add(transferIx);
      console.log("Sending transfer transaction...");
      const sig = await sendAndConfirmTransaction(connection, transferTx, [signer], {
        commitment: "confirmed",
      });
      console.log("Transfer transaction confirmed, signature:", sig);

      console.log("Mint & transfer complete");
      return sig;
    } catch (error) {
      console.error("Error in mintAndTransferToken:", error);
      throw error; // rethrow so caller knows something went wrong
    }
  };



  const update = useCallback(
    (options: { local?: boolean; cloud?: boolean }) => {
      setWallet((wallet) =>
        wallet
          ? {
            ...wallet,
            localBackupAt: options.local ? new Date() : wallet?.localBackupAt,
            cloudBackupAt: options.cloud ? new Date() : wallet?.cloudBackupAt,
          }
          : undefined
      );
    },
    []
  );
  useEffect(() => {
    if (wallet?.address) {
      getTransactions().catch(console.error);
    } else {
      setTransactions([]);
    }
  }, [wallet?.address, getTransactions]);



  const value = useMemo(
    () => ({
      isLoading,
      wallet,
      create,
      update,
      store,
      sign,
      clear,
      getTransactions,
      send,
      estimateTransactionCost,
      mintAndTransferToken,
      transactions,
      convertSolToUSD,
      convertUSDToSol,
    }),
    [isLoading, wallet, create, update, store, sign, clear, transactions]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}