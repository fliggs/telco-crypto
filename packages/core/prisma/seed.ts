import {
	AddressType,
	DeviceType,
	OnboardingStageType,
	PrismaClient,
	RewardType,
	SettingKey,
	SimStatus,
	SimType,
	VolumeType,
} from '@prisma/client';
import { hash } from 'bcrypt';

import { AuthProvider } from '../src/auth/dto/internal/auth-strategy.dto';
import { ContentBlockType } from '../src/content/content-block.type';
import {
	DEFAULT_BILLING_EDGE,
	DEFAULT_BILLING_OFFSET,
	DEFAULT_TELCO_EDGE,
	DEFAULT_TELCO_OFFSET,
	DEFAULT_VALID_FOR,
	ONE_DAY_IN_SECONDS,
} from '../src/defaults';

// TODO: This has to match the config in the 'local.service.ts' file.
const SALT_ROUNDS = 10;

const prisma = new PrismaClient();

async function main() {
	// ----- ADMIN -----
	const admin = await prisma.admin.upsert({
		where: {
			id: '74f39422-c2cb-4c10-bea6-f133f2a2d618',
		},
		create: {
			id: '74f39422-c2cb-4c10-bea6-f133f2a2d618',
			email: 'admin@local.host',
			firstName: 'Local',
			lastName: 'Admin',
			authData: {
				create: {
					provider: AuthProvider.Local,
					strategy: 'admin',
					data: {
						password: await hash('test', SALT_ROUNDS),
					},
				},
			},
		},
		update: {},
	});

	// ----- PLANS -----
	const planSmall = await prisma.plan.upsert({
		where: {
			id: '9af2db39-f2ee-4ac9-9589-19e6d797863a',
		},
		create: {
			id: '9af2db39-f2ee-4ac9-9589-19e6d797863a',
			name: 'small',
			version: 1,
			isStandalone: true,
			validForSeconds: DEFAULT_VALID_FOR, // in seconds
			doesAutoRenew: true,
			billingEdge: DEFAULT_BILLING_EDGE,
			billingOffset: DEFAULT_BILLING_OFFSET,
			telcoEdge: DEFAULT_TELCO_EDGE,
			telcoOffset: DEFAULT_TELCO_OFFSET,
			volumes: {
				create: [
					{
						type: VolumeType.DATA,
						amount: 1_000_000_000, // in bytes
						isRoaming: false,
						isUnlimited: false,
					},
					{
						type: VolumeType.CALL,
						amount: 1000,
						isRoaming: false,
						isUnlimited: true,
					},
					{
						type: VolumeType.TEXT,
						amount: 1000,
						isRoaming: false,
						isUnlimited: true,
					},
				],
			},
			content: {
				tags: null,
				title: 'Small',
				details: [
					{
						type: ContentBlockType.LIST,
						items: ['1GB data'],
						title: 'Internet',
					},
				],
				summary: {
					type: ContentBlockType.LIST,
					items: ['1 GB of data', 'Blockchain rewards every month'],
					title: '',
				},
			},
		},
		update: {},
	});

	// ----- OFFERS -----
	const offerSmall = await prisma.offer.upsert({
		where: {
			id: 'bc3b41a7-2ade-4aca-81f1-fb8d9fb0d161',
		},
		create: {
			id: 'bc3b41a7-2ade-4aca-81f1-fb8d9fb0d161',
			name: 'small_std',
			version: 1,
			isActive: true,
			isPublic: true,
			sort: 1,
			cost: '20.00',
			planId: planSmall.id,
			content: {
				tags: ['plan'],
			},
		},
		update: {},
	});

	// ----- REWARDS -----
	await prisma.reward.upsert({
		where: {
			id: '97811e12-3e1c-4ce4-9145-d96b31c7c641',
		},
		create: {
			id: '97811e12-3e1c-4ce4-9145-d96b31c7c641',
			name: 'solana_cashback',
			type: RewardType.CASHBACK_CRYPTO,
			isActive: true,
			data: { provider: 'SOLANA' },
			content: {},
			offers: {
				connect: [{ id: offerSmall.id }],
			},
		},
		update: {},
	});

	// ----- SIMS -----
	await prisma.sim.upsert({
		where: {
			iccid: '1111111111111111111',
		},
		create: {
			iccid: '1111111111111111111',
			type: SimType.E_SIM,
			status: SimStatus.AVAILABLE,
			pin: '1111',
			pin2: '2222',
			puk: '12345678',
			puk2: '87654321',
		},
		update: {
			pin: '1111',
			pin2: '2222',
			puk: '12345678',
			puk2: '87654321',
		},
	});

	// ----- ONBOARDING -----
	await prisma.onboardingStage.upsert({
		where: {
			name: 'intro_landing',
		},
		create: {
			name: 'intro_landing',
			type: OnboardingStageType.CONTENT,
			required: false,
			sort: 1,
			content: {
				bgImage: 'pixelated',
				details: [
					{
						type: ContentBlockType.IMAGE,
						image: 'logo',
					},
					{
						type: ContentBlockType.SPACER,
						spacing: 'MEDIUM',
					},
					{
						type: ContentBlockType.TEXT,
						text: 'Lorem ipsum',
						variant: 'H4',
					},
					{
						type: ContentBlockType.LIST,
						items: ['Lorem ipsum'],
					},
				],
			},
			data: null,
		},
		update: {},
	});
	await prisma.onboardingStage.upsert({
		where: {
			name: 'order_plan',
		},
		create: {
			name: 'order_plan',
			type: OnboardingStageType.ORDER_PLAN,
			required: true,
			sort: 100,
			content: {
				title: 'Pick your plan',
				summary: {
					type: ContentBlockType.TEXT,
					text: 'Lorem ipsum',
				},
			},
			data: null,
		},
		update: {},
	});
	await prisma.onboardingStage.upsert({
		where: {
			name: 'address',
		},
		create: {
			name: 'address',
			type: OnboardingStageType.ADDRESS,
			required: true,
			sort: 101,
			content: {
				title: 'Address',
			},
			data: {
				type: OnboardingStageType.ADDRESS,
				addressType: AddressType.Billing,
			},
		},
		update: {},
	});
	await prisma.onboardingStage.upsert({
		where: {
			name: 'order_msisdn',
		},
		create: {
			name: 'order_msisdn',
			type: OnboardingStageType.ORDER_MSISDN,
			required: true,
			sort: 102,
			content: {
				title: 'Phone Number',
			},
			data: null,
		},
		update: {},
	});
	await prisma.onboardingStage.upsert({
		where: {
			name: 'order_sim_type',
		},
		create: {
			name: 'order_sim_type',
			type: OnboardingStageType.ORDER_SIM_TYPE,
			required: true,
			sort: 103,
			content: {
				title: 'SIM type',
			},
			data: null,
		},
		update: {},
	});
	await prisma.onboardingStage.upsert({
		where: {
			name: 'order_confirm',
		},
		create: {
			name: 'order_confirm',
			type: OnboardingStageType.ORDER_CONFIRM,
			required: true,
			sort: 104,
			content: {
				title: 'Confirm',
			},
			data: {
				type: OnboardingStageType.ORDER_CONFIRM,
				payment: true,
				stages: ['order_plan', 'address', 'order_msisdn'],
			},
		},
		update: {},
	});
	await prisma.onboardingStage.upsert({
		where: {
			name: 'order_process',
		},
		create: {
			name: 'order_process',
			type: OnboardingStageType.ORDER_PROCESS,
			required: true,
			sort: 105,
			content: {
				title: 'Processing...',
			},
			data: {
				type: OnboardingStageType.ORDER_PROCESS,
				showInProgress: false,
			},
		},
		update: {},
	});

	// ----- DEVICES -----
	await prisma.device.createMany({
		data: [
			{ type: DeviceType.IOS, name: 'iPhone XR', eSimSupport: true },
			{
				type: DeviceType.ANDROID,
				name: 'Samsung Galaxy S20',
				eSimSupport: true,
			},
		],
		skipDuplicates: true,
	});

	// ----- COUNTRIES -----
	await prisma.country.createMany({
		data: [
			{ name: 'Canada', rate: 1.0, roaming: true, favourite: false },
			{ name: 'Mexico', rate: 0.1, roaming: true, favourite: true },
			{ name: 'New Zealand', rate: 1.2, roaming: true, favourite: false },
			{ name: 'Slovenia', rate: 0.35, roaming: true, favourite: false },
			{ name: 'Venezuela', rate: 0.18, roaming: true, favourite: false },
		],
		skipDuplicates: true,
	});

	// ----- SETTINGS -----
	await prisma.setting.upsert({
		where: {
			key: SettingKey.MOBILE_APP,
		},
		create: {
			key: SettingKey.MOBILE_APP,
			value: {
				iosMinVersion: '3.0.0',
				androidMinVersion: '3.0.0',
			},
		},
		update: {},
	});
	await prisma.setting.upsert({
		where: {
			key: SettingKey.TERMS_AND_CONDITIONS,
		},
		create: {
			key: SettingKey.TERMS_AND_CONDITIONS,
			value: {
				summary: {
					type: ContentBlockType.TEXT,
					title: 'Terms and Conditions',
					text: `
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut enim venenatis nunc semper tincidunt. Donec tempus, dui sed rutrum posuere, lacus justo venenatis libero, quis pellentesque turpis sapien a augue. Pellentesque sed luctus dui. Aenean nec gravida sem, vitae auctor felis. Vivamus lobortis dolor eget dolor finibus auctor nec a nulla. Nullam hendrerit, ex eget luctus posuere, tortor eros fermentum nibh, sed facilisis risus turpis sed metus. Duis et nisi ligula. Mauris suscipit quis velit eget finibus. Praesent purus velit, molestie egestas purus ut, vulputate pharetra ligula. Morbi rhoncus arcu quis vehicula tempor. Nulla lobortis rutrum metus id scelerisque.

						Vivamus vitae scelerisque diam, id euismod felis. Quisque lobortis elementum purus, vitae rhoncus neque. Nulla efficitur dui leo. Aliquam ac libero sed augue sagittis lobortis. Proin et augue suscipit, porttitor mi sed, tincidunt quam. Nam lacinia eleifend magna quis sagittis. Nullam vel gravida leo. Praesent euismod elit ut erat iaculis, ac pharetra nisl condimentum. Quisque quis blandit neque. Mauris viverra vestibulum lectus nec venenatis. Quisque vehicula finibus ligula laoreet hendrerit. Duis vitae finibus est, vitae dictum tortor. Vivamus et auctor enim. Vestibulum et arcu pharetra ante dictum convallis sed ut massa.

						Nullam vitae sapien suscipit, consectetur justo quis, luctus risus. Integer fermentum velit mauris, at consectetur nisl venenatis eu. Mauris volutpat nisi ac tellus dapibus vestibulum. Vestibulum eu dignissim erat. Cras sed finibus urna. Aliquam id nisi dictum nulla pulvinar fringilla non maximus tellus. Sed sagittis ligula quam, nec imperdiet ante lobortis ac. Phasellus aliquam, lacus euismod interdum bibendum, elit odio sodales tortor, et tincidunt quam dolor id dui. Maecenas ultricies risus nisi. Integer sit amet dui eget lectus ultricies tincidunt. Quisque placerat mattis nunc, eu posuere justo mattis a. Aenean non ligula in felis fringilla iaculis et sit amet libero. Phasellus vel quam libero. Fusce aliquam augue eu efficitur ultricies. Sed auctor odio non erat venenatis, ut pulvinar lorem varius. Mauris semper dictum est, nec ultrices neque hendrerit nec.

						Praesent tempor mollis lectus ac vestibulum. Quisque posuere vitae sem in egestas. Ut sit amet mauris ac sem eleifend ultrices et nec purus. Vivamus hendrerit libero eget arcu accumsan, eget vulputate est eleifend. Phasellus fringilla accumsan est, eu fermentum nisl auctor eu. Suspendisse potenti. Quisque fringilla arcu sed ex aliquam, nec lacinia sem eleifend. Pellentesque pellentesque lorem sodales felis tempus ultrices.

						In neque elit, ullamcorper at aliquet in, commodo non neque. Suspendisse in ultrices justo. Ut interdum lacus condimentum ipsum varius hendrerit. Vestibulum vestibulum felis vitae lorem porta, sit amet bibendum sapien laoreet. Quisque leo sapien, tempor a nibh nec, finibus euismod arcu. Morbi suscipit mauris a odio maximus tincidunt. Phasellus nec sollicitudin sem. Aliquam sit amet pharetra mi. Aliquam magna dui, pretium a nibh in, sagittis elementum ipsum. Donec tincidunt quam ex, sed pellentesque nisi porttitor nec. Donec sodales lorem enim, eget aliquet nulla convallis id. Ut lacus nibh, mollis vel imperdiet eu, imperdiet quis augue. Donec ultrices nibh et feugiat congue. Proin pellentesque et sem non feugiat. Nulla aliquet cursus dui a blandit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
					`,
				},
			},
		},
		update: {},
	});
	await prisma.setting.upsert({
		where: {
			key: SettingKey.PRIVACY_POLICY,
		},
		create: {
			key: SettingKey.PRIVACY_POLICY,
			value: {
				summary: {
					type: ContentBlockType.TEXT,
					title: 'Privacy Policy',
					text: `
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut enim venenatis nunc semper tincidunt. Donec tempus, dui sed rutrum posuere, lacus justo venenatis libero, quis pellentesque turpis sapien a augue. Pellentesque sed luctus dui. Aenean nec gravida sem, vitae auctor felis. Vivamus lobortis dolor eget dolor finibus auctor nec a nulla. Nullam hendrerit, ex eget luctus posuere, tortor eros fermentum nibh, sed facilisis risus turpis sed metus. Duis et nisi ligula. Mauris suscipit quis velit eget finibus. Praesent purus velit, molestie egestas purus ut, vulputate pharetra ligula. Morbi rhoncus arcu quis vehicula tempor. Nulla lobortis rutrum metus id scelerisque.

						Vivamus vitae scelerisque diam, id euismod felis. Quisque lobortis elementum purus, vitae rhoncus neque. Nulla efficitur dui leo. Aliquam ac libero sed augue sagittis lobortis. Proin et augue suscipit, porttitor mi sed, tincidunt quam. Nam lacinia eleifend magna quis sagittis. Nullam vel gravida leo. Praesent euismod elit ut erat iaculis, ac pharetra nisl condimentum. Quisque quis blandit neque. Mauris viverra vestibulum lectus nec venenatis. Quisque vehicula finibus ligula laoreet hendrerit. Duis vitae finibus est, vitae dictum tortor. Vivamus et auctor enim. Vestibulum et arcu pharetra ante dictum convallis sed ut massa.

						Nullam vitae sapien suscipit, consectetur justo quis, luctus risus. Integer fermentum velit mauris, at consectetur nisl venenatis eu. Mauris volutpat nisi ac tellus dapibus vestibulum. Vestibulum eu dignissim erat. Cras sed finibus urna. Aliquam id nisi dictum nulla pulvinar fringilla non maximus tellus. Sed sagittis ligula quam, nec imperdiet ante lobortis ac. Phasellus aliquam, lacus euismod interdum bibendum, elit odio sodales tortor, et tincidunt quam dolor id dui. Maecenas ultricies risus nisi. Integer sit amet dui eget lectus ultricies tincidunt. Quisque placerat mattis nunc, eu posuere justo mattis a. Aenean non ligula in felis fringilla iaculis et sit amet libero. Phasellus vel quam libero. Fusce aliquam augue eu efficitur ultricies. Sed auctor odio non erat venenatis, ut pulvinar lorem varius. Mauris semper dictum est, nec ultrices neque hendrerit nec.

						Praesent tempor mollis lectus ac vestibulum. Quisque posuere vitae sem in egestas. Ut sit amet mauris ac sem eleifend ultrices et nec purus. Vivamus hendrerit libero eget arcu accumsan, eget vulputate est eleifend. Phasellus fringilla accumsan est, eu fermentum nisl auctor eu. Suspendisse potenti. Quisque fringilla arcu sed ex aliquam, nec lacinia sem eleifend. Pellentesque pellentesque lorem sodales felis tempus ultrices.

						In neque elit, ullamcorper at aliquet in, commodo non neque. Suspendisse in ultrices justo. Ut interdum lacus condimentum ipsum varius hendrerit. Vestibulum vestibulum felis vitae lorem porta, sit amet bibendum sapien laoreet. Quisque leo sapien, tempor a nibh nec, finibus euismod arcu. Morbi suscipit mauris a odio maximus tincidunt. Phasellus nec sollicitudin sem. Aliquam sit amet pharetra mi. Aliquam magna dui, pretium a nibh in, sagittis elementum ipsum. Donec tincidunt quam ex, sed pellentesque nisi porttitor nec. Donec sodales lorem enim, eget aliquet nulla convallis id. Ut lacus nibh, mollis vel imperdiet eu, imperdiet quis augue. Donec ultrices nibh et feugiat congue. Proin pellentesque et sem non feugiat. Nulla aliquet cursus dui a blandit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
					`,
				},
			},
		},
		update: {},
	});
	await prisma.setting.upsert({
		where: {
			key: SettingKey.ORDER_STEP_RETRIES,
		},
		create: {
			key: SettingKey.ORDER_STEP_RETRIES,
			value: {
				default: [10, 3600, ONE_DAY_IN_SECONDS, ONE_DAY_IN_SECONDS],
			},
		},
		update: {},
	});
	await prisma.setting.upsert({
		where: {
			key: SettingKey.FAQ,
		},
		create: {
			key: SettingKey.FAQ,
			value: {
				summary: {
					type: ContentBlockType.TEXT,
					title: 'What is this?',
					text: 'This is the FAQ (frequently asked questions) section.',
				},
			},
		},
		update: {},
	});

	// ----- GROUPS -----
	await prisma.userGroup.upsert({
		where: {
			id: 'ca491e29-a7d3-42a5-8eba-40f5556153ec',
		},
		create: {
			id: 'ca491e29-a7d3-42a5-8eba-40f5556153ec',
			name: 'Default',
			isDefaultGroup: true,
			isNewWalletEnabled: true,
			isPromoCodeFieldEnabled: false,
		},
		update: {},
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
