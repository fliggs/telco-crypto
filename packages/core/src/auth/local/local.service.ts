import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { Request } from 'express';
import { randomInt } from 'node:crypto';
import { add, isAfter } from 'date-fns';

import { CrmService } from '@/crm/crm.service';
import { DbService } from '@/db/db.service';
import { UserService } from '@/user/user.service';
import { AdminService } from '@/admin/admin.service';
import { EventsService } from '@/events/events.service';
import { SessionService } from '@/session/session.service';
import { SessionTokens } from '@/session/dto/internal/session-tokens.dto';
import { USER_EVENT_CREATED, USER_EVENT_VERIFIED } from '@/user/user.events';

import { LoggedInSubject } from '../logged-in.decorator';
import {
	AuthProvider,
	AuthStrategyDto,
} from '../dto/internal/auth-strategy.dto';

import { LocalConfig, AuthLocalConfig } from './dto/internal/config.dto';
import { AuthLocalUserDataDto } from './dto/internal/user-data.dto';
import { AuthLocalUserUpdateDto } from './dto/request/user-update.dto';
import { AuthLocalAdminUpdateDto } from './dto/request/admin-update.dto';
import { AuthLocalAdminDataDto } from './dto/internal/admin-data.dto';

const VERIFY_CODE_VALIDITY_LENGTH = 5; // in minutes
const SALT_ROUNDS = 10;

@Injectable()
export class LocalService {
	private readonly name = AuthProvider.Local;
	private readonly strategies: Map<string, LocalConfig> = new Map();

	constructor(
		private readonly config: ConfigService,
		private readonly db: DbService,
		private readonly userService: UserService,
		private readonly adminService: AdminService,
		private readonly sessionService: SessionService,
		private readonly eventsService: EventsService,
		private readonly crmService: CrmService,
	) {}

	async onModuleInit() {
		const auth = this.config.getOrThrow<AuthLocalConfig>('auth');
		if (auth[this.name]) {
			for (const [name, conf] of Object.entries(auth[this.name])) {
				this.strategies.set(name, conf);
			}
		}
	}

	findStrategies(admin: boolean): AuthStrategyDto[] {
		return [...this.strategies]
			.filter(([, cfg]) => cfg.admin === admin)
			.map(([name, cfg]) => ({
				provider: this.name,
				name,
				title: cfg.title,
				tags: cfg.tags,
			}));
	}

	async login(
		req: Request,
		strategy: string,
		email: string,
		password: string,
	): Promise<SessionTokens> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			const admin = await this.loginAdmin(strategy, email, password);
			this.sessionService.store(req, this.name, strategy, { user: admin });
			req.user = admin;
		} else {
			const user = await this.loginUser(strategy, email, password);
			this.sessionService.store(req, this.name, strategy, { user: user });
			req.user = user;
		}

		return this.sessionService.generateTokens(req.user);
	}

	private async loginAdmin(
		strategy: string,
		email: string,
		password: string,
	): Promise<LoggedInSubject> {
		const admin = await this.adminService.findByEmail(email);
		if (!admin) {
			throw new UnauthorizedException('not_authorized');
		}
		if (admin.deletedAt) {
			throw new UnauthorizedException('admin_blocked');
		}

		const adminAuthData = await this.db.adminAuthData.findUnique({
			where: {
				provider_strategy_adminId: {
					adminId: admin.id,
					provider: this.name,
					strategy,
				},
			},
		});
		if (!adminAuthData) {
			throw new UnauthorizedException('not_authorized');
		}

		const adminData = adminAuthData.data as AuthLocalUserDataDto;

		const pwCorrect = await compare(password, adminData.password ?? '');
		if (!pwCorrect) {
			throw new UnauthorizedException('not_authorized');
		}

		return {
			provider: this.name,
			strategy,
			isAdmin: true,
			settings: null,
			groupId: null,
			group: null,
			...admin,
		};
	}

	private async loginUser(
		strategy: string,
		email: string,
		password: string,
	): Promise<LoggedInSubject> {
		const user = await this.userService.findByEmailWithGroupAndSettings(email);
		if (user.deletedAt) {
			throw new UnauthorizedException('user_blocked');
		}

		const userAuthData = await this.db.userAuthData.findUnique({
			where: {
				provider_strategy_userId: {
					userId: user.id,
					provider: this.name,
					strategy,
				},
			},
		});
		if (!userAuthData) {
			throw new UnauthorizedException('not_authorized');
		}

		const userData = userAuthData.data as AuthLocalUserDataDto;

		const pwCorrect = await compare(password, userData.password ?? '');
		if (!pwCorrect) {
			throw new UnauthorizedException('not_authorized');
		}

		if (!userData.verifiedAt) {
			throw new UnauthorizedException('user_not_verified');
		}

		return {
			provider: this.name,
			strategy,
			isAdmin: false,
			...user,
		};
	}

	async signup(
		strategy: string,
		email: string,
		password: string,
		firstName: string,
		lastName: string,
	): Promise<void> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const existing = await this.userService
			.findByEmailWithGroupAndSettings(email)
			.catch(() => null);
		if (existing) {
			throw new BadRequestException('email_in_use');
		}

		const pw = await hash(password, SALT_ROUNDS);

		const user = await this.userService.create({
			email,
			firstName,
			lastName,
		});

		const [code, expiresAt] = this.generate6DigitCode();

		const data: AuthLocalUserDataDto = {
			password: pw,
			verifiedAt: null,
			verifyCode: code,
			verifyCodeExpiresAt: expiresAt,
			resetCode: null,
			resetCodeExpiresAt: null,
		};

		await this.db.userAuthData.create({
			data: {
				userId: user.id,
				provider: this.name,
				strategy,
				data,
			},
		});

		await this.crmService.sendVerifyCode(user.email, code);

		const cachedUser: LoggedInSubject = {
			provider: this.name,
			strategy,
			isAdmin: strat.admin,
			...user,
		};

		this.eventsService.emit(USER_EVENT_CREATED, cachedUser);
	}
	async changeUnverifiedEmail(
		strategy: string,
		oldEmail: string,
		newEmail: string,
	): Promise<void> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const existingUser = await this.userService
			.findByEmailWithGroupAndSettings(newEmail)
			.catch(() => null);
		if (existingUser) {
			throw new BadRequestException('email_in_use');
		}

		const user =
			await this.userService.findByEmailWithGroupAndSettings(oldEmail);

		const userAuthData = await this.db.userAuthData.findUnique({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
		});

		if (!userAuthData) {
			throw new BadRequestException('missing_user_data');
		}

		const userData = userAuthData.data as AuthLocalUserDataDto;

		if (userData.verifiedAt) {
			throw new BadRequestException('user_already_verified');
		}

		await this.userService.update(user.id, { email: newEmail });

		const [code, expiresAt] = this.generate6DigitCode();
		userData.verifyCode = code;
		userData.verifyCodeExpiresAt = expiresAt;
		userData.verifiedAt = null;

		await this.db.userAuthData.update({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
			data: {
				data: userData,
			},
		});
		await this.crmService.sendVerifyCode(newEmail, code);
	}

	async updateUser(
		strategy: string,
		userId: string,
		dto: AuthLocalUserUpdateDto,
	) {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const authData = await this.db.userAuthData.findUnique({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: userId,
				},
			},
		});

		const userData: AuthLocalUserDataDto = authData?.data ?? {};

		if (dto.newPassword) {
			const pw = await hash(dto.newPassword, SALT_ROUNDS);
			userData.password = pw;
		}

		if (dto.verify) {
			userData.verifiedAt = new Date().toISOString();
			userData.verifyCode = null;
			userData.verifyCodeExpiresAt = null;
		}

		return this.db.userAuthData.upsert({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: userId,
				},
			},
			create: {
				provider: this.name,
				strategy,
				userId: userId,
				data: userData,
			},
			update: {
				data: userData,
			},
		});
	}

	async updateAdmin(
		strategy: string,
		adminId: string,
		dto: AuthLocalAdminUpdateDto,
	) {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (!strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const authData = await this.db.adminAuthData.findUnique({
			where: {
				provider_strategy_adminId: {
					provider: this.name,
					strategy,
					adminId: adminId,
				},
			},
		});

		const adminData: AuthLocalAdminDataDto = authData?.data ?? {};

		if (dto.newPassword) {
			const pw = await hash(dto.newPassword, SALT_ROUNDS);
			adminData.password = pw;
		}

		return this.db.adminAuthData.upsert({
			where: {
				provider_strategy_adminId: {
					provider: this.name,
					strategy,
					adminId: adminId,
				},
			},
			create: {
				provider: this.name,
				strategy,
				adminId: adminId,
				data: adminData,
			},
			update: {
				data: adminData,
			},
		});
	}

	async verify(
		req: Request,
		strategy: string,
		email: string,
		code: string,
	): Promise<SessionTokens> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const user = await this.userService.findByEmailWithGroupAndSettings(email);
		if (user.deletedAt) {
			throw new UnauthorizedException('user_blocked');
		}

		const userAuthData = await this.db.userAuthData.findUnique({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
		});
		if (!userAuthData) {
			throw new BadRequestException('missing_user_data');
		}

		const userData = userAuthData.data as AuthLocalUserDataDto;

		if (
			!userData.verifyCodeExpiresAt ||
			isAfter(new Date(), userData.verifyCodeExpiresAt)
		) {
			throw new BadRequestException('code_expired');
		}
		if (userData.verifyCode !== code) {
			throw new BadRequestException('invalid_code');
		}

		userData.verifiedAt = new Date().toISOString();
		userData.verifyCode = null;
		userData.verifyCodeExpiresAt = null;

		await this.db.userAuthData.update({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
			data: {
				data: userData,
			},
		});

		const cachedUser: LoggedInSubject = {
			provider: this.name,
			strategy,
			isAdmin: strat.admin,
			...user,
		};

		this.eventsService.emit(USER_EVENT_VERIFIED, cachedUser);

		this.sessionService.store(req, this.name, strategy, {
			user: cachedUser,
		});
		req.user = cachedUser;

		return this.sessionService.generateTokens(req.user);
	}

	async resetVerify(strategy: string, email: string) {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const user = await this.userService.findByEmailWithGroupAndSettings(email);
		if (user.deletedAt) {
			throw new UnauthorizedException('user_blocked');
		}

		const userAuthData = await this.db.userAuthData.findUnique({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
		});
		if (!userAuthData) {
			throw new BadRequestException('missing_user_data');
		}

		const userData = userAuthData.data as AuthLocalUserDataDto;

		if (userData.verifiedAt) {
			throw new BadRequestException('user_already_verified');
		}

		const [code, expiresAt] = this.generate6DigitCode();
		userData.verifyCode = code;
		userData.verifyCodeExpiresAt = expiresAt;

		await this.db.userAuthData.update({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
			data: {
				data: userData,
			},
		});

		await this.crmService.sendVerifyCode(user.email, code);
	}

	async resetPassword(strategy: string, email: string) {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const user = await this.userService.findByEmailWithGroupAndSettings(email);
		if (user.deletedAt) {
			throw new UnauthorizedException('user_blocked');
		}

		const userAuthData = await this.db.userAuthData.findUnique({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
		});
		if (!userAuthData) {
			throw new BadRequestException('missing_user_data');
		}

		const userData = userAuthData.data as AuthLocalUserDataDto;

		const [code, expiresAt] = this.generate6DigitCode();
		userData.resetCode = code;
		userData.resetCodeExpiresAt = expiresAt;

		await this.db.userAuthData.update({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
			data: {
				data: userData,
			},
		});

		await this.crmService.sendResetCode(user.email, code);
	}

	async setPassword(
		req: Request,
		strategy: string,
		email: string,
		code: string,
		password: string,
	): Promise<SessionTokens> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (strat.admin) {
			throw new BadRequestException('not_supported');
		}

		const user = await this.userService.findByEmailWithGroupAndSettings(email);
		if (user.deletedAt) {
			throw new UnauthorizedException('user_blocked');
		}

		const userAuthData = await this.db.userAuthData.findUnique({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
		});
		if (!userAuthData) {
			throw new BadRequestException('missing_user_data');
		}

		const userData = userAuthData.data as AuthLocalUserDataDto;

		if (
			!userData.resetCodeExpiresAt ||
			isAfter(new Date(), userData.resetCodeExpiresAt)
		) {
			throw new BadRequestException('code_expired');
		}
		if (userData.resetCode !== code) {
			throw new BadRequestException('invalid_code');
		}

		const pw = await hash(password, SALT_ROUNDS);

		userData.password = pw;
		userData.verifiedAt = userData.verifiedAt ?? new Date().toISOString();
		userData.verifyCode = null;
		userData.verifyCodeExpiresAt = null;
		userData.resetCode = null;
		userData.resetCodeExpiresAt = null;

		await this.db.userAuthData.update({
			where: {
				provider_strategy_userId: {
					provider: this.name,
					strategy,
					userId: user.id,
				},
			},
			data: {
				data: userData,
			},
		});

		const cachedUser: LoggedInSubject = {
			provider: this.name,
			strategy,
			isAdmin: strat.admin,
			...user,
		};

		this.eventsService.emit(USER_EVENT_VERIFIED, cachedUser);

		this.sessionService.store(req, this.name, strategy, {
			user: cachedUser,
		});
		req.user = cachedUser;

		return this.sessionService.generateTokens(req.user);
	}

	generate6DigitCode(): [string, string] {
		const code = randomInt(0, 999999).toString();
		const expiresAt = add(new Date(), {
			minutes: VERIFY_CODE_VALIDITY_LENGTH,
		}).toISOString();
		return ['0'.repeat(6 - code.length) + code, expiresAt];
	}
}
