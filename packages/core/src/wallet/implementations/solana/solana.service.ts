import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { BinaryToTextEncoding, createHash } from 'crypto';
import {
	Order,
	User,
	UserSettings,
	Wallet,
	WalletCashbackCurrency,
	WalletProvider,
} from '@prisma/client';
import { add } from 'date-fns';
import { getTransferSolInstruction } from '@solana-program/system';
import {
	fetchMaybeToken,
	fetchMint,
	fetchToken,
	findAssociatedTokenPda,
	getCreateAssociatedTokenInstructionAsync,
	getMintToCheckedInstruction,
	getTransferCheckedInstruction,
	TOKEN_2022_PROGRAM_ADDRESS,
} from '@solana-program/token-2022';
import {
	Address,
	address,
	appendTransactionMessageInstruction,
	appendTransactionMessageInstructions,
	createKeyPairFromPrivateKeyBytes,
	createSignableMessage,
	createSignerFromKeyPair,
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	createTransactionMessage,
	getAddressEncoder,
	getBase58Encoder,
	getProgramDerivedAddress,
	getPublicKeyFromAddress,
	getSignatureFromTransaction,
	Instruction,
	isNone,
	KeyPairSigner,
	pipe,
	Rpc,
	RpcSubscriptions,
	sendAndConfirmTransactionFactory,
	setTransactionMessageFeePayer,
	setTransactionMessageFeePayerSigner,
	setTransactionMessageLifetimeUsingBlockhash,
	SignatureBytes,
	signTransactionMessageWithSigners,
	SolanaRpcApiMainnet,
	SolanaRpcSubscriptionsApi,
	verifySignature,
} from '@solana/kit';
import {
	Attestation,
	deriveAttestationPda,
	deriveCredentialPda,
	deriveSchemaPda,
	deserializeAttestationData,
	fetchAllMaybeAttestation,
	fetchMaybeAttestation,
	fetchSchema,
	getCloseAttestationInstruction,
	getCreateAttestationInstruction,
	Schema,
	serializeAttestationData,
	SOLANA_ATTESTATION_SERVICE_PROGRAM_ADDRESS,
} from 'sas-lib';

import { DecimalNumber } from '@/decimal.dto';
import { WalletProviderService } from '@/wallet/provider.service';
import { TokenBalanceDto } from '@/wallet/dto/internal/balance.dto';
import { CertificateDto } from '@/wallet/dto/internal/cerificate.dto';
import { TokenHistoryDto } from '@/wallet/dto/internal/token.dto';

import { AttestationData } from './dto/internal/attestation.dto';

const SAS_CREDENTIAL_NAME = 'fliggs';
const SAS_SCHEMA_NAME = 'fliggs';
const TOKENS = [
	{
		name: 'Solana',
		symbol: 'SOL',
		decimals: 9,
		image:
			'https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756',
		mint: null,
		cgId: 'solana',
	},
	{
		name: 'USDC',
		symbol: 'USDC',
		decimals: 6,
		image:
			'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694',
		mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
		cgId: 'usd-coin',
	},
	{
		name: 'Bitcoin',
		symbol: 'WBTC',
		decimals: 8,
		image:
			'https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857',
		mint: '5XZw2LKTyrfvfiskJ78AMpackRjPcyCif1WhUsPDuVqQ',
		cgId: 'wrapped-bitcoin',
	},
];

@Injectable()
export class WalletProviderSolanaService
	extends WalletProviderService
	implements OnModuleInit
{
	private readonly name = WalletProvider.SOLANA;
	protected readonly logger = new Logger(WalletProviderSolanaService.name);

	private pdaSecret: string;
	private rpc: Rpc<SolanaRpcApiMainnet>;
	private rpcSubs: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
	private signer: KeyPairSigner;
	private authorityAddress: Address;
	private credAddress: Address;
	private schemaAddress: Address;
	private schema: Schema;

	async onModuleInit() {
		const rpcUrl = this.config.getOrThrow('WALLET_SOLANA_RPC_URL');
		this.rpc = createSolanaRpc(rpcUrl);

		const rpcSubUrl = this.config.getOrThrow('WALLET_SOLANA_RPC_SUB_URL');
		this.rpcSubs = createSolanaRpcSubscriptions(rpcSubUrl);

		this.pdaSecret = this.config.getOrThrow('WALLET_SOLANA_PDA_SECRET');

		this.authorityAddress = address(
			this.config.getOrThrow('WALLET_SOLANA_AUTHORITY_ADDRESS'),
		);
		this.logger.debug(`Authority: ${this.authorityAddress}`);

		const base58Key = this.config.getOrThrow('WALLET_SOLANA_PRIVATE_KEY');
		const keypair = await createKeyPairFromPrivateKeyBytes(
			getBase58Encoder().encode(base58Key),
		);
		this.signer = await createSignerFromKeyPair(keypair);
		this.logger.debug(`Signer: ${this.signer.address}`);

		if (this.signer.address !== this.authorityAddress) {
			throw new Error('incorrect_authority_address');
		}

		const credential = await deriveCredentialPda({
			authority: this.authorityAddress,
			name: SAS_CREDENTIAL_NAME,
		});
		this.credAddress = credential[0];
		this.logger.debug(`Credential: ${this.credAddress}`);

		const schemaPda = await deriveSchemaPda({
			credential: credential[0],
			name: SAS_SCHEMA_NAME,
			version: 1, // NOTE: This has to always equal 1 becuase of a rust bug
		});
		this.schemaAddress = schemaPda[0];
		this.logger.debug(`Schema: ${this.schemaAddress}`);

		const schemaAccount = await fetchSchema(this.rpc, schemaPda[0]);
		this.schema = schemaAccount.data;

		if (this.config.get('ENV') !== 'production') {
			await this.setupDev();
		}
	}

	async setupDev() {
		const base58Key = this.config.getOrThrow('WALLET_SOLANA_MINT_PRIVATE_KEY');
		const keypair = await createKeyPairFromPrivateKeyBytes(
			getBase58Encoder().encode(base58Key),
		);
		const mint = await createSignerFromKeyPair(keypair);
		this.logger.debug(`Mint: ${mint.address}`);

		const [associatedTokenAddress] = await findAssociatedTokenPda({
			mint: mint.address,
			owner: this.signer.address,
			tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
		});

		const accountRes = await this.rpc
			.getTokenAccountsByOwner(
				this.signer.address,
				{ mint: address(mint.address) },
				{ encoding: 'base64' },
			)
			.send()
			.catch(() => null);
		if (!accountRes) {
			throw new InternalServerErrorException('could_not_get_signer_balance');
		}

		const tokenRes = await Promise.all(
			accountRes.value.map((v) =>
				this.rpc.getTokenAccountBalance(v.pubkey).send(),
			),
		);

		const value = tokenRes.reduce(
			(total, t) => total.add(new DecimalNumber(t.value.amount)),
			new DecimalNumber(0),
		);

		this.logger.debug(
			`Fake Token Balance: ${value.div(100_000_000).toFixed()}`,
		);

		// If we have a low balance of fake tokens then mint some
		if (value.lt(1000)) {
			const mintToIx = getMintToCheckedInstruction({
				mint: mint.address,
				token: associatedTokenAddress,
				mintAuthority: this.signer,
				amount: 1_000_000_000_000n, // 10000
				decimals: 8,
			});

			const { value: latestBlockhash } = await this.rpc
				.getLatestBlockhash()
				.send();

			const transactionMessage = pipe(
				createTransactionMessage({ version: 0 }),
				(tx) => setTransactionMessageFeePayerSigner(this.signer, tx),
				(tx) =>
					setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
				(tx) => appendTransactionMessageInstructions([mintToIx], tx),
			);

			const signedTransaction =
				await signTransactionMessageWithSigners(transactionMessage);

			await sendAndConfirmTransactionFactory({
				rpc: this.rpc,
				rpcSubscriptions: this.rpcSubs,
			})(signedTransaction, { commitment: 'confirmed' });

			const txSignature = getSignatureFromTransaction(signedTransaction);
			this.logger.debug(`Minted fake tokens: ${txSignature}`);
		}

		// Replace the actual tokens with out fake ones in dev/staging
		TOKENS[1].mint = mint.address;
		TOKENS[2].mint = mint.address;
	}

	override async payout(
		user: User & { settings: UserSettings | null },
		wallet: Wallet,
		order: Order,
		amountInUsd: DecimalNumber,
		description: string,
	): Promise<unknown> {
		const currency = user.settings?.cashbackCurrency;
		const token = TOKENS.find((t) => t.symbol === currency);

		if (!currency || !token) {
			throw new InternalServerErrorException(
				`invalid_cashback_currency:${currency}`,
			);
		}

		const prices = await this.priceService.fetchCurrentPrices([token.cgId]);
		const price = new DecimalNumber(prices[token.cgId].usd);

		const transferAmount = amountInUsd
			.div(price)
			.mul(new DecimalNumber(10).pow(token.decimals))
			.floor();

		this.logger.debug(
			`Sending ${transferAmount} ${token.symbol} = $${amountInUsd}`,
		);

		let signature: string | null = null;
		const receiverAddr = address(wallet.address);

		const { value: latestBlockhash } = await this.rpc
			.getLatestBlockhash()
			.send();

		switch (currency) {
			case WalletCashbackCurrency.SOL: {
				const transferInstruction = getTransferSolInstruction({
					source: this.signer,
					destination: receiverAddr,
					amount: BigInt(transferAmount.toString()),
				});

				const transactionMessage = pipe(
					createTransactionMessage({ version: 0 }),
					(tx) => setTransactionMessageFeePayerSigner(this.signer, tx),
					(tx) =>
						setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
					(tx) =>
						appendTransactionMessageInstructions([transferInstruction], tx),
				);

				const signedTransaction =
					await signTransactionMessageWithSigners(transactionMessage);

				await sendAndConfirmTransactionFactory({
					rpc: this.rpc,
					rpcSubscriptions: this.rpcSubs,
				})(signedTransaction, { commitment: 'confirmed' });

				signature = getSignatureFromTransaction(signedTransaction);
				break;
			}

			case WalletCashbackCurrency.USDC:
			case WalletCashbackCurrency.WBTC: {
				if (!token.mint) {
					throw new InternalServerErrorException('missing_token_mint');
				}

				const mint = await fetchMint(this.rpc, address(token.mint));
				const mintAddr = mint.address;
				if (isNone(mint.data.mintAuthority)) {
					throw new InternalServerErrorException('missing_mint_authority');
				}

				const mintAuth = mint.data.mintAuthority.value;

				const [senderATA] = await findAssociatedTokenPda({
					mint: mintAddr,
					owner: this.signer.address,
					tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
				});

				const [receiverATA] = await findAssociatedTokenPda({
					mint: mintAddr,
					owner: receiverAddr,
					tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
				});

				const instructions: Instruction[] = [];

				const receiverAtaDetails = await fetchMaybeToken(this.rpc, receiverATA);
				if (!receiverAtaDetails.exists) {
					const createReceiverATAInstruction =
						await getCreateAssociatedTokenInstructionAsync({
							payer: this.signer,
							mint: mint.address,
							owner: receiverAddr,
						});
					instructions.push(createReceiverATAInstruction);
				}

				const transferInstruction = getTransferCheckedInstruction({
					source: senderATA,
					mint: mintAddr,
					destination: receiverATA,
					authority: mintAuth,
					amount: BigInt(transferAmount.toString()),
					decimals: token.decimals,
				});

				instructions.push(transferInstruction);

				const transactionMessage = pipe(
					createTransactionMessage({ version: 0 }),
					(tx) => setTransactionMessageFeePayerSigner(this.signer, tx),
					(tx) =>
						setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
					(tx) => appendTransactionMessageInstructions(instructions, tx),
				);

				const signedTransaction =
					await signTransactionMessageWithSigners(transactionMessage);

				await sendAndConfirmTransactionFactory({
					rpc: this.rpc,
					rpcSubscriptions: this.rpcSubs,
				})(signedTransaction, { commitment: 'confirmed' });

				signature = getSignatureFromTransaction(signedTransaction);
				break;
			}

			default: {
				throw new InternalServerErrorException(
					`invalid_cashback_currency:${currency}`,
				);
			}
		}

		this.logger.log(
			`Sent ${transferAmount} ${token.symbol} = $${amountInUsd} @ ${signature}`,
		);

		return {
			signature,
		};
	}

	override async validate(
		userId: string,
		wallet: Wallet,
		message: string,
		signature: string,
	): Promise<boolean> {
		const key = await getPublicKeyFromAddress(address(wallet.address));
		const msg = createSignableMessage(message);
		const sigBytes = getBase58Encoder().encode(signature) as SignatureBytes;
		return verifySignature(key, sigBytes, msg.content);
	}

	override async createCertificate(
		userId: string,
		wallet: Wallet,
		msisdn: string,
	): Promise<CertificateDto> {
		const [nonce, attestAddr] = await this.getAttestationPda(
			userId,
			address(wallet.address),
			msisdn,
		);

		this.logger.debug(
			`Creating attestation ${attestAddr} for ${wallet.address}`,
		);

		const { exists } = await fetchMaybeAttestation(this.rpc, attestAddr);
		if (exists) {
			this.logger.debug(
				`Revoking existing attestation ${attestAddr} for ${wallet.address}`,
			);
			await this.revokeAttestation(attestAddr);
		}

		const data = {
			owner: this.getHash(userId, 'base64'),
			createdAt: Math.floor(new Date().getTime() / 1000),
		};

		const in2Months = Math.floor(
			add(new Date(), { months: 2 }).getTime() / 1000,
		);

		await this.createAttestation(attestAddr, nonce, in2Months, data);

		return {
			id: attestAddr,
			phoneNumberMsisdn: msisdn,
			issuedAt: new Date(data.createdAt * 1000),
			expiresAt: new Date(in2Months * 1000),
		};
	}

	override async getTokens(
		userId: string,
		wallet: Wallet,
	): Promise<TokenBalanceDto[]> {
		const addr = address(wallet.address);

		const prices = await this.priceService.fetchCurrentPrices(
			TOKENS.map((t) => t.cgId),
		);

		const balances: TokenBalanceDto[] = [];

		for (const token of TOKENS) {
			let value: DecimalNumber;
			if (token.mint === null) {
				const res = await this.rpc.getBalance(addr).send();
				value = new DecimalNumber(res.value);
			} else {
				const accountRes = await this.rpc
					.getTokenAccountsByOwner(
						addr,
						{ mint: address(token.mint) },
						{ encoding: 'base64' },
					)
					.send()
					.catch(() => null);
				if (!accountRes) {
					continue;
				}

				const tokenRes = await Promise.all(
					accountRes.value.map((v) =>
						this.rpc.getTokenAccountBalance(v.pubkey).send(),
					),
				);

				value = tokenRes.reduce(
					(total, t) => total.add(new DecimalNumber(t.value.amount)),
					new DecimalNumber(0),
				);
			}

			const price = new DecimalNumber(prices[token.cgId].usd);
			const exp = new DecimalNumber(10).pow(token.decimals);
			const bal = value.div(exp);

			balances.push({
				name: token.name,
				symbol: token.symbol,
				decimals: token.decimals,
				image: token.image,
				exchangeRateUsd: price,
				balance: bal,
				balanceInUsd: price.mul(bal),
			});
		}

		return balances;
	}

	override async getTokenHistory(
		userId: string,
		wallet: Wallet,
		tokenName: string,
		days: number,
	): Promise<TokenHistoryDto[]> {
		const token = TOKENS.find((t) => t.symbol === tokenName);
		if (!token) {
			throw new NotFoundException(`token_not_found:${tokenName}`);
		}
		const { prices } = await this.priceService.fetchHistoricPrices(
			token.cgId,
			days,
		);
		return prices.map(([ts, price]) => ({ ts: new Date(ts), price }));
	}

	override async getCertificates(
		userId: string,
		wallet: Wallet,
		phoneNumberMsisdns: string[],
	): Promise<CertificateDto[]> {
		const addr = address(wallet.address);

		const attestationAddresses: Map<Address, string> = new Map();
		for (const msisdn of phoneNumberMsisdns) {
			const [, attestAddr] = await this.getAttestationPda(userId, addr, msisdn);
			attestationAddresses.set(attestAddr, msisdn);
		}

		const attestations = await fetchAllMaybeAttestation(this.rpc, [
			...attestationAddresses.keys(),
		]);

		const userHash = this.getHash(userId, 'base64');
		const certificates: CertificateDto[] = [];
		for (const attest of attestations) {
			if (!attest.exists) {
				continue;
			}

			const data = this.getAttestationData(attest.data);

			const msisdn = attestationAddresses.get(attest.address);

			if (msisdn && data.owner === userHash) {
				certificates.push({
					id: attest.address,
					phoneNumberMsisdn: msisdn,
					issuedAt: new Date(Number(data.createdAt) * 1000),
					expiresAt: new Date(Number(attest.data.expiry) * 1000),
				});
			}
		}

		return certificates;
	}

	private getHash(value: string, encoding?: BinaryToTextEncoding) {
		const hasher = createHash('sha256');
		hasher.update(value);
		return encoding ? hasher.digest(encoding) : hasher.digest();
	}

	private getAttestationData(attestation: Attestation) {
		return deserializeAttestationData<AttestationData>(
			this.schema,
			new Uint8Array(attestation.data),
		);
	}

	private async revokeAttestation(attestAddr: Address) {
		const eventAuthority = await getProgramDerivedAddress({
			programAddress: SOLANA_ATTESTATION_SERVICE_PROGRAM_ADDRESS,
			seeds: ['__event_authority'],
		});

		const transaction = getCloseAttestationInstruction({
			payer: this.signer,
			authority: this.signer,
			credential: this.credAddress,
			attestation: attestAddr,
			eventAuthority: eventAuthority[0],
			attestationProgram: SOLANA_ATTESTATION_SERVICE_PROGRAM_ADDRESS,
		});

		const { value: latestBlockhash } = await this.rpc
			.getLatestBlockhash()
			.send();

		const transactionMessage = pipe(
			createTransactionMessage({ version: 0 }),
			(tx) => setTransactionMessageFeePayer(this.signer.address, tx),
			(tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
			(tx) => appendTransactionMessageInstruction(transaction, tx),
		);

		const signedTransaction =
			await signTransactionMessageWithSigners(transactionMessage);

		const sendAndConfirm = sendAndConfirmTransactionFactory({
			rpc: this.rpc,
			rpcSubscriptions: this.rpcSubs,
		});

		await sendAndConfirm(signedTransaction, {
			commitment: 'confirmed',
			skipPreflight: true,
		});

		const signature = getSignatureFromTransaction(signedTransaction);
		this.logger.log(
			`Revoke attestation ${attestAddr} signed with ${signature}`,
		);
		return signature;
	}

	private async createAttestation(
		attestAddr: Address,
		nonce: Address,
		expires: number,
		data: Record<string, unknown>,
	) {
		const transaction = getCreateAttestationInstruction({
			payer: this.signer,
			authority: this.signer,
			credential: this.credAddress,
			schema: this.schemaAddress,
			nonce: nonce,
			expiry: expires,
			data: serializeAttestationData(this.schema, data),
			attestation: attestAddr,
		});

		const { value: latestBlockhash } = await this.rpc
			.getLatestBlockhash()
			.send();

		const transactionMessage = pipe(
			createTransactionMessage({ version: 0 }),
			(tx) => setTransactionMessageFeePayer(this.signer.address, tx),
			(tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
			(tx) => appendTransactionMessageInstruction(transaction, tx),
		);

		const signedTransaction =
			await signTransactionMessageWithSigners(transactionMessage);

		const sendAndConfirm = sendAndConfirmTransactionFactory({
			rpc: this.rpc,
			rpcSubscriptions: this.rpcSubs,
		});

		await sendAndConfirm(signedTransaction, {
			commitment: 'confirmed',
			skipPreflight: true,
		});

		const signature = getSignatureFromTransaction(signedTransaction);
		this.logger.log(
			`Created attestation ${attestAddr} signed with ${signature}`,
		);
		return signature;
	}

	private async getAttestationPda(
		userId: string,
		walletAddress: Address,
		msisdn: string,
	): Promise<[Address, Address]> {
		const addressEncoder = getAddressEncoder();

		const nonce = await getProgramDerivedAddress({
			programAddress: walletAddress,
			seeds: [
				this.pdaSecret,
				this.getHash(userId),
				addressEncoder.encode(walletAddress),
				this.getHash(msisdn),
			],
		});

		const attestationPda = await deriveAttestationPda({
			credential: this.credAddress,
			schema: this.schemaAddress,
			nonce: nonce[0],
		});

		return [nonce[0], attestationPda[0]];
	}
}
