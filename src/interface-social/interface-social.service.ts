import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import * as cron from 'node-cron';
import { lastValueFrom } from 'rxjs';
import { ActivityEntity } from '../user/activity.entity';
import { HttpService } from '@nestjs/axios';
import { TokenService } from '../token/token.service';
const pLimit = require('p-limit');


@Injectable()
export class InterfaceSocialService implements OnModuleInit {
    private timings: { [key: string]: number } = {};
    private isTaskRunning = false;
    private readonly requestLimit = pLimit(2);
    private readonly activityRequestLimit = pLimit(3);
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly httpService: HttpService,
    ) {}


    private startTimer(label: string) {
        if (!this.timings[label]) this.timings[label] = 0;
        console.time(label);
    }

    private endTimer(label: string) {
        console.timeEnd(label);
        const time = performance.now() - performance.now();
        this.timings[label] += time;
    }

    private logTimings() {
        console.log('Execution Timings:');
        for (const [label, time] of Object.entries(this.timings)) {
            console.log(`${label}: ${(time / 1000).toFixed(2)} seconds`);
        }
    }

    async fetchAndSaveLeaderboardUsers(): Promise<User[]> {
        console.log('Fetching users from leaderboard...');
        try {
            const leaderboardUsers = await this.getLeaderboard();
            console.log(
                `Leaderboard users fetched: ${leaderboardUsers.length}`,
            );

            if (leaderboardUsers.length === 0) {
                console.log('No users fetched from leaderboard, fetching users from the database...');
                return await this.userService.getUsers();
            }

            console.log('Saving leaderboard users to the database...');
            await this.userService.saveUsers(leaderboardUsers);
            console.log('Users saved successfully.');
        } catch (error) {
            console.error('Error fetching or saving users:', error.message);
        }

        console.log('Fetching all users from the database...');
        return await this.userService.getUsers();
    }

    async fetchUserActivity(address: string): Promise<ActivityEntity[]> {
        const label = `fetchUserActivity_${address}`;
        this.startTimer(label);

        const url = `https://app.interface.social/api/profile/${address}/activity`;
        const maxRetries = 2;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await this.activityRequestLimit(() =>
                    lastValueFrom(this.httpService.get(url, { timeout: 10000 }))
                );

                const { txs } = response.data;

                const activities = txs.map((tx: any) => ({
                    id: tx.id,
                    block: tx.block,
                    category: tx.category,
                    date: new Date(tx.date),
                    toAddress: tx.toAddress || null,
                    chainName: tx.chain?.name || null,
                    chainUrl: tx.chain?.url || null,
                    chainImage: tx.chain?.image || null,
                    methodName: tx.method?.name || null,
                    methodSuffix: tx.method?.suffix || null,
                    toName: tx.to?.name || null,
                    toImage: tx.to?.image || null,
                    shareUrl: tx.share?.url || null,
                    shareImage: tx.share?.image || null,
                    shareTitle: tx.share?.title || null,
                    tokens: tx.tokens || [],
                    gallery: tx.gallery || [],
                    copies: tx.copies || [],
                }));

                this.endTimer(label);
                return activities;
            } catch (error: any) {
                const status = error?.response?.status;

                if (status === 429 && attempt < maxRetries - 1) {
                    const delay = (attempt + 1) * 500;
                    console.warn(`⏳ 429 Retry ${attempt + 1} for ${address}, waiting ${delay}ms`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }

                console.error(`❌ Failed to fetch activity for ${address}:`, error.message);
                this.endTimer(label);
                return [];
            }
        }

        this.endTimer(label);
        return [];
    }



    // async fetchUserActivity(address: string): Promise<ActivityEntity[]> {
    //     const label = `fetchUserActivity_${address}`;
    //     this.startTimer(label);
    //
    //     const url = `https://app.interface.social/api/profile/${address}/activity`;
    //     console.log(`Fetching activity for address: ${address}`);
    //
    //     try {
    //         const response = await this.activityRequestLimit(() =>
    //             lastValueFrom(this.httpService.get(url, { timeout: 10000 }))
    //         );
    //
    //         // const response = await lastValueFrom(this.httpService.get(url));
    //         // console.log('Response data:', response.data);
    //
    //         const { txs } = response.data;
    //         const activities = txs.map((tx: any) => ({
    //             id: tx.id,
    //             block: tx.block,
    //             category: tx.category,
    //             date: new Date(tx.date),
    //             toAddress: tx.toAddress || null,
    //             chainName: tx.chain?.name || null,
    //             chainUrl: tx.chain?.url || null,
    //             chainImage: tx.chain?.image || null,
    //             methodName: tx.method?.name || null,
    //             methodSuffix: tx.method?.suffix || null,
    //             toName: tx.to?.name || null,
    //             toImage: tx.to?.image || null,
    //             shareUrl: tx.share?.url || null,
    //             shareImage: tx.share?.image || null,
    //             shareTitle: tx.share?.title || null,
    //             tokens: tx.tokens || [],
    //             gallery: tx.gallery || [],
    //             copies: tx.copies || [],
    //         }));
    //         this.endTimer(label);
    //         return activities;
    //     } catch (error) {
    //         console.error(
    //             `Error fetching activity for address ${address}:`,
    //             error.message,
    //         );
    //         this.endTimer(label);
    //         return [];
    //     }
    // }

    async getLeaderboard() {
        const label = 'getLeaderboard';
        this.startTimer(label);
        try {
            const url =
                'https://app.interface.social/api/leaderboard?limit=450&round=1&offset=0';

            const headers = {
                accept: '*/*',
                'accept-language': 'en',
                'content-type': 'application/json',
                cookie: 'wagmi.store={"state":{"connections":{"__type":"Map","value":[]},"chainId":1,"current":null},"version":2}; i18next=en; ph_phc_ytp0VTJmi6l4gD2KiNBCO3kCetLE8K1scXWgsSqLMss_posthog=%7B%22distinct_id%22%3A%220193df79-07c5-7b2a-980f-a8cfa719bf4e%22%2C%22%24sesid%22%3A%5B1734877195433%2C%220193eeba-cd7c-7217-aa46-19f06f7180de%22%2C1734877039996%5D%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fapp.interface.social%2Fleaderboard%22%7D%7D',
                priority: 'u=1, i',
                referer: 'https://app.interface.social/leaderboard',
                'sec-ch-ua':
                    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            };

            console.log('Fetching leaderboard...');
            const response = await this.requestLimit(() => axios.get(url, { headers }));

            // const response = await axios.get(url, { headers });
            console.log('Leaderboard Data fetched successfully');
            this.endTimer(label);
            return response.data;
        } catch (error) {
            this.endTimer(label);
            throw new Error(`Failed to fetch leaderboard: ${error.message}`);
        }
    }

    async fetchAndSaveUserTrades(user: User) {
        const label = `fetchAndSaveUserTrades_${user.address}`;
        this.startTimer(label);

        const address = user.address;
        if (!address) return;

        console.log('Fetching trades for user:', address);
        const url = `https://app.interface.social/api/profile/${address}/pnl`;
        try {
            // const response = await axios.get(url);
            const response = await this.requestLimit(() => axios.get(url));

            const trades = response.data;

            await this.userService.saveTrades(user, trades);
            console.log('Trades saved successfully:', trades.length);
        } catch (error) {
            console.error(
                `Error fetching trades for user ${address}:`,
                error.message,
            );
        } finally {
            this.endTimer(label);
        }
    }

    private async fetchTokensForUser(userId: string): Promise<any[]> {
        const url = `https://app.interface.social/api/tokens/${userId}`;
        console.log(`Fetching tokens for user ${userId}...`);

        // const response = await axios.get(url);
        const response = await this.requestLimit(() => axios.get(url));

        return response.data;
    }

    async saveTokensForUser(address: string): Promise<void> {
        try {
            const tokenData = await this.fetchTokensForUser(address);
            const user = await this.userService.findUserByAddress(address);

            if (!user) {
                console.error(`User not found for address: ${address}`);
                return;
            }

            await this.userService.saveTokens(user.id, tokenData);
            console.log(`Tokens saved for user ${address}.`);
        } catch (error) {
            console.error(`Failed to fetch or save tokens for user ${address}:`, error.message);
        }
    }

    async fetchTokenData(chainId: number, tokenAddress: string): Promise<any> {
        const url = `https://app.interface.social/api/token/${chainId}/${tokenAddress}`;
        try {
            const response = await this.requestLimit(() => axios.get(url));

            // const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                console.error(`Rate limit exceeded for token ${tokenAddress}. Retrying...`);

                await new Promise((resolve) => setTimeout(resolve, 1000));
                return this.fetchTokenData(chainId, tokenAddress);
            } else {
                console.error(`Error fetching data for token ${tokenAddress}:`, error.message);
                return null;
            }
        }
    }

    async processTokens(): Promise<void> {
        console.log('Starting token data processing...');
        const uniqueTokenAddresses = await this.userService.getUniqueTokenAddresses();
        console.log(`Found ${uniqueTokenAddresses.length} unique token addresses.`);
        const limit = pLimit(5);

        const processingTasks = uniqueTokenAddresses.map((token) =>
            limit(async () => {
                const { tokenAddress, chainId } = token;
                console.log(`Processing token: ${tokenAddress}`);

                const tokenData = await this.fetchTokenData(chainId, tokenAddress);

                if (tokenData) {
                    await this.tokenService.saveToken(tokenData);
                    console.log(`Token data saved for: ${tokenAddress}`);
                }
            }),
        );

        await Promise.all(processingTasks);

        console.log('Token data processing completed.');
    }

    async fetchTop24hTokens(): Promise<any[]> {
        try {
            console.log('Fetching Top 24h Traded Tokens...');
            const url = `https://app.interface.social/api/discovery/coins`;
            // const response = await axios.get(url);
            const response = await this.requestLimit(() => axios.get(url));

            if (response.status === 200 && response.data.groups) {
                const top24hGroup = response.data.groups.find(
                    (group) => group.name === 'Top Traded 24h'
                );

                return top24hGroup ? top24hGroup.tokens : [];
            }

            console.warn('No Top 24h tokens found in response');
            return [];
        } catch (error) {
            console.error('Error fetching Top 24h tokens:', error.message);
            return [];
        }
    }

    async updateTop24hTokensInDB(): Promise<void> {
        console.log('Updating Top 24h Tokens in DB...');

        try {
            const tokens = await this.fetchTop24hTokens();
            if (!tokens.length) {
                console.log('No tokens found. Skipping update.');
                return;
            }

            await this.tokenService.saveTop24hTokens(tokens);
            console.log(`Successfully updated ${tokens.length} Top 24h Tokens in DB.`);
        } catch (error) {
            console.error('Error updating Top 24h Tokens in DB:', error.message);
        }
    }

    async setupTop24hTokensTask(): Promise<void> {
        console.log('Setting up hourly task for Top 24h Tokens...');
        cron.schedule('0 * * * *', async () => {
            console.log('Running hourly update for Top 24h Tokens...');
            await this.updateTop24hTokensInDB();
        });
    }

    // async setupTopHoldersProcessingTask(): Promise<void> {
    //     console.log('Setting up daily task for processing top holders...');
    //     cron.schedule('0 10 * * *', async () => {
    //         console.log('Running daily task for processing top holders...');
    //         try {
    //             await this.tokenService.processTopHoldersForAllTokens();
    //             console.log('Top holders processing completed successfully.');
    //         } catch (error) {
    //             console.error('Error processing top holders:', error.message);
    //         }
    //     });
    // }


    async setupTopTradersProcessingTask(): Promise<void> {
        console.log('Setting up daily task for processing top traders...');
        cron.schedule('0 11 * * *', async () => {
            console.log('Running daily task for processing top traders...');
            try {
                await this.tokenService.processAllTokens();
                console.log('Top traders processing completed successfully.');
            } catch (error) {
                console.error('Error processing top traders:', error.message);
            }
        });
    }

    async setupTokenProcessingTask(): Promise<void> {
        console.log('Setting up daily task for token processing...');
        cron.schedule('0 12 * * *', async () => {
            console.log('Running daily token processing task...');
            await this.processTokens();
        });
    }

    async setupDailyUserTradesTask() {
        console.log('Setting up daily task for fetching user trades...');

        cron.schedule('0 16 * * *', async () => {
            console.log('Running daily task at midnight...');
            const users = await this.userService.getUsers();

            console.log(`Found ${users.length} users, processing with concurrency limit...`);

            const limit = pLimit(5);
            const tradePromises = users.map(user => limit(() => this.fetchAndSaveUserTrades(user)));

            const results = await Promise.allSettled(tradePromises);

            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    console.error(`Error fetching trades for user ${users[index].address}:`, result.reason);
                }
            });

            console.log('Daily user trade fetch task completed.');
        });
    }

    async setupDailyUserTokensTask() {
        console.log('Setting up scheduled task for fetching user trades...');
        cron.schedule('0 */6 * * *', async () => {
            console.log('Running scheduled task for user trades...');
            const users = await this.userService.getUsers();
            for (const user of users) {
                console.log(`Fetching tokens for user: ${user.address}`);
                await this.saveTokensForUser(user.address);
            }
        });
    }

    // async runTasks() {
    //     const label = 'runTasks';
    //     this.startTimer(label);
    //     const start = Date.now();
    //
    //     const users = await this.fetchAndSaveLeaderboardUsers();
    //     console.log(`Total users to process: ${users.length}`);
    //
    //     const limit = pLimit(50);
    //     const batchSize = 50;
    //
    //     let totalSuccess = 0;
    //     let totalFailures = 0;
    //
    //     const chunkArray = <T>(array: T[], size: number): T[][] =>
    //         Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    //             array.slice(i * size, i * size + size)
    //         );
    //
    //     const userChunks = chunkArray(users, batchSize);
    //
    //     for (const [chunkIndex, chunk] of userChunks.entries()) {
    //         console.log(`🧩 Processing chunk ${chunkIndex + 1}/${userChunks.length} (${chunk.length} users)`);
    //
    //         const results = await Promise.allSettled(chunk.map(user =>
    //             limit(async () => {
    //                 console.time(`⏱ ${user.address}`);
    //                 try {
    //                     const activities = await this.fetchUserActivity(user.address);
    //
    //                     if (activities.length > 0) {
    //                         await this.userService.saveActivities(user.address, activities);
    //                         console.log(`✅ Saved ${activities.length} activities for ${user.address}`);
    //                     } else {
    //                         console.log(`⚠️ No activities for ${user.address}`);
    //                     }
    //
    //                     totalSuccess++;
    //                 } catch (error) {
    //                     console.error(`❌ Failed to process ${user.address}:`, error.message);
    //                     totalFailures++;
    //                 }
    //             })
    //         ));
    //     }
    //
    //     console.log(`\n🏁 Activity fetch completed: ✅ ${totalSuccess}, ❌ ${totalFailures}`);
    //     console.log(`⏱ runTasks took ${(Date.now() - start) / 1000}s`);
    //     this.endTimer(label);
    //     this.logTimings();
    // }


    async runTasks() {
        const label = 'runTasks';
        this.startTimer(label);

        const users = await this.fetchAndSaveLeaderboardUsers();
        console.log(`Total users to process: ${users.length}`);

        const limit = pLimit(20);

        console.log('Users fetched from the database:', users.length);

        const results = await Promise.allSettled(users.map((user, index) =>
            limit(async () => {
                console.log(`Processing user ${index + 1}/${users.length}: ${user.address}`);

                try {
                    console.log(`Fetching activity for user: ${user.address}`);
                    const activities = await this.fetchUserActivity(user.address);

                    if (activities.length > 0) {
                        console.log(`Saving ${activities.length} activities for user: ${user.address}`);
                        await this.userService.saveActivities(user.address, activities);
                    } else {
                        console.log(`No activities found for user: ${user.address}`);
                    }
                } catch (error) {
                    console.error(`Error processing user ${user.address}:`, error.message);
                    return { status: 'error', reason: error.message };
                }
            })
        ));

        console.log('Processing completed.');

        const failedUsers = results
            .map((result, index) => ({ result, user: users[index] }))
            .filter(({ result }) => result.status === "rejected") as { result: PromiseRejectedResult; user: User }[];

        if (failedUsers.length > 0) {
            console.log(`Failed to process ${failedUsers.length} users:`);
            failedUsers.forEach(({ user, result }) =>
                console.error(`User ${user.address} failed:`, result.reason)
            );
        }

        this.endTimer(label);
        this.logTimings();
    }

    async onModuleInit() {
        console.log('Starting task loop...');
        const users = await this.fetchAndSaveLeaderboardUsers();
        console.log(`Total users to process: ${users.length}`);

        // const users = await this.userService.getUsers();

        console.log(`Found ${users.length} users, processing with concurrency limit...`);

        const limit = pLimit(5);
        const tradePromises = users.map(user => limit(() => this.fetchAndSaveUserTrades(user)));

        const results = await Promise.allSettled(tradePromises);

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(`Error fetching trades for user ${users[index].address}:`, result.reason);
            }
        });

        console.log('Daily user trade fetch task completed.');

        // tokens data
        await this.setupTokenProcessingTask();
        await this.setupTopTradersProcessingTask();
        // await this.setupTopHoldersProcessingTask();
        await this.setupTop24hTokensTask();

        // users data
        await this.setupDailyUserTokensTask();
        await this.setupDailyUserTradesTask();

        while (true) {
            if (!this.isTaskRunning) {
                this.isTaskRunning = true;
                await this.runTasks();
                this.isTaskRunning = false;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
            // await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));
        }
    }
}
