import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './user.entity';
import { Trade } from './trade.entity';
import { ActivityEntity } from './activity.entity';
import { Queue } from './queue.entity';
import { Token } from './token.entity';
import { TokenPosition } from './token.position.entity';
import axios from 'axios';

interface TokenData {
    id: number;
    address: string;
    amount: number;
    chain: string;
    decimals?: number;
    image?: string | null;
    title?: string;
    symbol?: string;
    price?: number;
    rawValue?: number;
    value?: string[] | number;
    logo?: string;
}

interface NetworkData {
    id: number;
    name: string;
    image: string;
    symbol: string;
    summaryAmount: number;
    tokens: TokenData[];
}


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Trade)
        private tradeRepository: Repository<Trade>,
        @InjectRepository(ActivityEntity)
        private activityRepository: Repository<ActivityEntity>,
        @InjectRepository(Queue)
        private queueRepository: Repository<Queue>,
        @InjectRepository(Token)
        private tokenRepository: Repository<Token>,
        @InjectRepository(TokenPosition)
        private tokenPositionRepository: Repository<TokenPosition>,
    ) {
    }

    async saveUsers(users: any[]): Promise<void> {
        for (const user of users) {
            // console.log(`User here: ${JSON.stringify(user, null, 2)}`);
            const address = user.user?.address;
            console.log(`Checking user address: ${address || 'undefined'}`);

            if (!address) {
                console.error('Skipping user with missing address.');
                continue;
            }

            const existingUser = await this.userRepository.findOne({
                where: { address },
            });

            const context = {
                avgUsdPerCopier: user.stats.avgUsdPerCopier,
                avgUsdPerCopy: user.stats.avgUsdPerCopy,
                address: user.stats.address,
                totalCopies: user.stats.totalCopies,
                totalUsdCopied: user.stats.totalUsdCopied,
                uniqueCopiers: user.stats.uniqueCopiers,
                totalUsdVolume: user.stats.totalUsdVolume,
                uniqueCopiedTxs: user.stats.uniqueCopiedTxs,
                followingTotal: user.user?.followingTotal || 0,
                followersTotal: user.user?.followersTotal || 0,
                createdAt: user.user?.createdAt,
            };

            if (existingUser) {
                existingUser.context = context;
                try {
                    await this.userRepository.save(existingUser);
                    console.log(`Updated context for user: ${address}`);
                } catch (error) {
                    console.error(
                        `Error updating context for user ${address}:`,
                        error.message,
                    );
                }
                console.log(`User already exists: ${address}`);
                continue;
            }

            const newUser = new User();
            newUser.address = address;
            newUser.fullDomain = user.user?.fullDomain || '';
            newUser.avatar = user.user?.avatar || '';
            newUser.description = user.user?.description || '';
            newUser.context = context;

            try {
                await this.userRepository.save(newUser);
                console.log(`User saved: ${address}`);
            } catch (error) {
                console.error(`Error saving user ${address}:`, error.message);
            }
        }
    }

    async getUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async saveTrades(user: User, trades: any[]): Promise<void> {
        const existingTrades = new Set(
            (
                await this.tradeRepository.find({ where: { userId: user.id } })
            ).map((trade) => trade.tokenAddress),
        );

        for (const trade of trades) {
            try {
                if (existingTrades.has(trade.token.address)) {
                    // console.log(`Trade already exists for token ${trade.token.address}, skipping.`);
                    continue;
                }

                const newTrade = new Trade();
                newTrade.tokenAddress = trade.token.address;
                newTrade.chainId = trade.token.chainId;
                newTrade.decimals = trade.token.decimals;
                newTrade.name = trade.token.name;
                newTrade.symbol = trade.token.symbol;
                newTrade.imageUrl = trade.token.imageUrl;
                newTrade.totalSupply = trade.token.totalSupply;

                newTrade.boughtCount = trade.stats.boughtCount;
                newTrade.boughtAmount = trade.stats.boughtAmount;
                newTrade.soldCount = trade.stats.soldCount;
                newTrade.soldAmount = trade.stats.soldAmount;
                newTrade.totalCount = trade.stats.totalCount;
                newTrade.pnlAmount = trade.stats.pnlAmount;
                newTrade.pnlPercent = trade.stats.pnlPercent;

                newTrade.user = user;

                await this.tradeRepository.save(newTrade);
                console.log(`Trade saved for token ${trade.token.address}.`);
                existingTrades.add(trade.token.address);
            } catch (error) {
                console.error(
                    `Failed to save trade for token ${trade.token.address}: ${error.message}`,
                );
                continue;
            }
        }
    }

    async saveActivities(address: string, activities: any[]): Promise<void> {
        const now = Date.now();
        console.log('Current time (timestamp):', now);

        const nowReadable = new Date(now).toISOString();
        console.log('Current time (readable ISO):', nowReadable);

        const nowLocal = new Date(now).toLocaleString();
        console.log('Current time (local):', nowLocal);

        const fiveHoursAgo = now - 10 * 60 * 60 * 1000;
        console.log('Ten hours ago (timestamp):', fiveHoursAgo);

        const fiveHoursAgoReadable = new Date(fiveHoursAgo).toISOString();
        console.log('Ten hours ago (readable ISO):', fiveHoursAgoReadable);

        const fiveHoursAgoLocal = new Date(fiveHoursAgo).toLocaleString();
        console.log('Ten hours ago (local):', fiveHoursAgoLocal);
        const filteredActivities = activities.filter((activity) => {
            const activityTime = new Date(activity.date).getTime();
            return activityTime >= fiveHoursAgo && activityTime <= now;
        });

        for (const activity of filteredActivities) {
            try {
                const existingActivity = await this.activityRepository.findOne({
                    where: { id: activity.id },
                });

                if (existingActivity) {
                    console.log(
                        `Activity already exists for ID ${activity.id}, skipping.`,
                    );
                    continue;
                }
                const user = await this.userRepository.findOne({
                    where: { address: activity.user?.address || address },
                });

                if (!user) {
                    console.error(
                        `User not found for address ${activity.user?.address || address}`,
                    );
                    continue;
                }

                const newActivity = new ActivityEntity();
                newActivity.id = activity.id;
                newActivity.block = activity.block;
                newActivity.category = activity.category;
                newActivity.user = user;
                newActivity.userId = user.id;

                newActivity.date = new Date(activity.date);

                if (activity.chainName) {
                    newActivity.chainName = activity.chainName;
                    newActivity.chainUrl = activity.chainUrl;
                    newActivity.chainImage = activity.chainImage;
                }

                if (activity.methodName) {
                    newActivity.methodName = activity.methodName;
                    newActivity.methodSuffix = activity.methodSuffix;
                }

                if (activity.toName) {
                    newActivity.toName = activity.toName;
                    newActivity.toImage = activity.toImage;
                }

                if (activity.shareUrl) {
                    newActivity.shareUrl = activity.shareUrl;
                    newActivity.shareImage = activity.shareImage;
                    newActivity.shareTitle = activity.shareTitle;
                }

                newActivity.tokens = activity.tokens || [];

                newActivity.gallery = activity.gallery || [];
                newActivity.copies = activity.copies || [];

                await this.activityRepository.save(newActivity);
                console.log(`Activity saved with ID ${activity.id}.`);

                console.log("Start processing token position");
                await this.saveTokenPosition(newActivity);
            } catch (error) {
                console.error(
                    `Failed to save activity with ID ${activity.id}: ${error.message}`,
                );
                continue;
            }
        }
    }

    async getUniqueTokenAddresses(): Promise<{ tokenAddress: string; chainId: number }[]> {
        return this.tradeRepository
            .createQueryBuilder('trade')
            .select(['DISTINCT trade.tokenAddress AS "tokenAddress"', 'trade.chainId AS "chainId"'])
            .getRawMany();
    }


    async saveTokens(userId: number, tokenData: any[]): Promise<void> {
        await this.tokenRepository.delete({ userId });

        const tokensToSave = [];

        for (const network of tokenData) {
            const { name: networkName, image: networkImage, summaryAmount, tokens } = network;

            for (const token of tokens) {
                const tokenValue = Array.isArray(token.value)
                    ? parseFloat(token.value[0]?.replace(',', '') || '0')
                    : parseFloat(token.value);

                const tokenRawValue = Array.isArray(token.rawValue)
                    ? parseFloat(token.rawValue[0]?.replace(',', '') || '0')
                    : parseFloat(token.rawValue);

                const newToken = this.tokenRepository.create({
                    chain: networkName,
                    networkName,
                    networkImage,
                    summaryAmount: parseFloat(summaryAmount),
                    address: token.address,
                    title: token.title,
                    symbol: token.symbol,
                    amount: parseFloat(token.amount),
                    decimals: token.decimals,
                    price: token.price,
                    rawValue: tokenRawValue,
                    value: tokenValue,
                    tokenImage: token.image,
                    logo: token.logo,
                    userId,
                });

                tokensToSave.push(newToken);
            }
        }

        await this.tokenRepository.save(tokensToSave);
    }


    async findUserByAddress(address: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { address } });
    }

    extractTokensFromActivity(activity: ActivityEntity): { symbol: string; address: string; amount: number }[] {
        if (!activity.tokens) return [];

        try {
            const activityTokens = Array.isArray(activity.tokens) ? activity.tokens : JSON.parse(activity.tokens || '[]');

            if (!Array.isArray(activityTokens) || activityTokens.length < 2) {
                return [];
            }

            return activityTokens.map((token) => ({
                symbol: token.symbol || '',
                address: token.address || '',
                amount: Array.isArray(token.amount)
                    ? parseFloat(token.amount[0].replace(',', '')) || 0
                    : (typeof token.amount === 'string' ? parseFloat(token.amount.replace(',', '')) : token.amount) || 0,
            }));
        } catch (error) {
            console.error(`Error parsing tokens for activity ${activity.id}:`, error);
            return [];
        }
    }

    determineTokenFocus(activity: ActivityEntity): {
        focusToken: { address: string; symbol: string; amount: number };
        tradeType: 'sell' | 'buy';
    } | null {
        const IGNORED_TOKENS = ['ETH', 'USDT', 'USDC', 'DAI', 'USDbC', 'WETH', 'WBTC'];
        const activityTokens = this.extractTokensFromActivity(activity);

        if (!activityTokens || activityTokens.length !== 2) {
            return null;
        }

        const [firstToken, secondToken] = activityTokens;
        console.log(firstToken);
        console.log(secondToken);
        const firstIgnored = IGNORED_TOKENS.includes(firstToken.symbol);
        const secondIgnored = IGNORED_TOKENS.includes(secondToken.symbol);

        if (firstIgnored && !secondIgnored) {
            return { focusToken: { ...secondToken }, tradeType: 'buy' };
        }

        if (!firstIgnored && secondIgnored) {
            return { focusToken: { ...firstToken }, tradeType: 'sell' };
        }

        return null;
    }



    async saveTokenPosition(activity: ActivityEntity): Promise<void> {
        console.log(`Processing token position for activity ${activity.id}...`);

        if (activity.methodName !== 'Swapped') {
            return;
        }

        const focusResult = this.determineTokenFocus(activity);
        if (!focusResult) {
            console.warn(`Could not determine focus token for activity ${activity.id}`);
            return;
        }

        const { focusToken, tradeType } = focusResult;
        const amount = focusToken.amount;

        const user = await this.userRepository.findOne({ where: { id: activity.userId } });
        if (!user) {
            console.warn(`User not found for activity ${activity.id}`);
            return;
        }
        let existingToken = await this.tokenRepository.findOne({
            where: { userId: user.id, address: focusToken.address, chain: activity.chainName },
        });

        let position: 'opened' | 'added' | 'reduced' | 'closed';

        if (!existingToken) {
            if (tradeType === 'sell') {
                console.error(`❌ Ошибка: Пользователь пытается продать токен ${focusToken.address}, которого нет в базе!`);
                return;
            }
            position = 'opened';

            existingToken = this.tokenRepository.create({
                userId: user.id,
                chain: activity.chainName,
                address: focusToken.address,
                title: focusToken.symbol,
                symbol: focusToken.symbol,
                amount,
                decimals: 18,
                price: 0,
                rawValue: 0,
                value: 0,
                tokenImage: '',
                logo: '',
            });

            await this.tokenRepository.save(existingToken);
        } else {
            const previousAmount = existingToken.amount;

            if (tradeType === 'buy') {
                position = 'added';
                existingToken.amount += amount;
            } else {
                const remainingAmount = previousAmount - amount;

                if (remainingAmount <= 0) {
                    position = 'closed';
                    existingToken.amount = 0;
                } else {
                    position = 'reduced';
                    existingToken.amount = remainingAmount;
                }
            }

            await this.tokenRepository.save(existingToken);
        }

        const newPosition = this.tokenPositionRepository.create({
            date: new Date(),
            activityId: activity.id,
            userId: user.id,
            address: focusToken.address,
            chain: activity.chainName,
            operation: tradeType,
            amount,
            position,
        });

        await this.tokenPositionRepository.save(newPosition);
        console.log(`Saved token position for activity ${activity.id} with position: ${position}`);
    }
}


