import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalToken } from './token.entity';
import axios from 'axios';
import { TopTrader } from './top.traders.entity';
import { TopHolder } from './top.holders.entity';
import { Top24hToken } from './top24.token.entity';
const pLimit = require('p-limit');


@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(GlobalToken)
        private readonly tokenRepository: Repository<GlobalToken>,
        @InjectRepository(TopTrader)
        private readonly topTraderRepository: Repository<TopTrader>,
        @InjectRepository(TopHolder)
        private readonly topHolderRepository: Repository<TopHolder>,
        @InjectRepository(Top24hToken)
        private readonly top24hTokenRepository: Repository<Top24hToken>,
    ) {}

    async saveToken(tokenData: any): Promise<void> {
        const {
            id,
            chainId,
            title,
            symbol,
            address,
            totalSupply,
            decimals,
            image,
            by,
            created,
            contract,
            chain,
            socials,
        } = tokenData;

        if (!id || !address) {
            console.log(`No token data: ${JSON.stringify(tokenData)}`);
            return;
        }

        const scrapedData = await this.scrapeTokenMetrics(address);

        const newToken = this.tokenRepository.create({
            id,
            chainId,
            title,
            symbol,
            address,
            totalSupply: totalSupply && !isNaN(parseFloat(totalSupply)) ? totalSupply : null, // Сохраняем как строку
            decimals,
            image,
            creatorAddress: by?.address || null,
            created: created && !isNaN(Date.parse(created)) ? new Date(created) : null,
            contractAddress: contract?.address || null,
            contractDeploymentHash: contract?.deploymentHash || null,
            chainName: chain?.name || null,
            chainImage: chain?.image || null,
            chainUrl: chain?.url || null,
            socials: socials || null,
            marketCap: scrapedData?.marketCap || null,
            liquidity: scrapedData?.liquidity || null,
            volume: scrapedData?.volume || null,
        });

        try {
            await this.tokenRepository.save(newToken);
            console.log(`Token ${symbol} saved successfully.`);
        } catch (error) {
            console.error(`Error saving token ${symbol}:`, error.message);
        }
    }

    async scrapeTokenMetrics(address: string): Promise<{ marketCap: string; liquidity: string; volume: string } | null> {
        try {
            const url = `https://app.interface.social/api/token/8453/${address}/market`;
            const response = await axios.get(url);

            if (response.status === 200 && response.data) {
                const { market, liquidity, volume } = response.data;
                return {
                    marketCap: market,
                    liquidity,
                    volume,
                };
            } else {
                console.warn(`Failed to fetch market data for address: ${address}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching token metrics for address: ${address}:`, error.message);
            return null;
        }
    }

    async processAllTokens(): Promise<void> {
        const limit = pLimit(5);

        try {
            const tokens = await this.tokenRepository.find();

            console.log(`Found ${tokens.length} tokens. Processing with concurrency limit...`);

            const processingTasks = tokens.map((token) =>
                limit(async () => {
                    const retryDelay = 2000;

                    try {
                        console.log(`Processing token: ${token.symbol} (${token.address})`);
                        await this.saveTopTraders(token.address, token.id);
                        console.log(`Token ${token.symbol} processed successfully.`);
                    } catch (error) {
                        if (axios.isAxiosError(error) && error.response?.status === 429) {
                            console.error(
                                `Rate limit exceeded for token ${token.symbol}. Retrying after ${retryDelay / 1000} seconds...`,
                            );
                            await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Ждём перед повторной попыткой
                            try {
                                console.log(`Retrying token: ${token.symbol}`);
                                await this.saveTopTraders(token.address, token.id);
                                console.log(`Token ${token.symbol} processed successfully after retry.`);
                            } catch (retryError) {
                                console.error(`Failed to process token ${token.symbol} after retry:`, retryError.message);
                            }
                        } else {
                            console.error(`Error processing token ${token.symbol}:`, error.message);
                        }
                    }
                }),
            );

            await Promise.all(processingTasks);

            console.log('Processing of all tokens completed.');
        } catch (error) {
            console.error('Error processing tokens:', error.message);
        }
    }

    async saveTopTraders(address: string, tokenId: string): Promise<void> {
        const maxTraders = 100;
        const traders = await this.fetchTopTraders(address, maxTraders);

        await this.topTraderRepository.delete({ tokenId });

        const traderEntities = traders.map((trader) => {
            const { user, stats } = trader;
            return this.topTraderRepository.create({
                tokenId,
                userAddress: user.address,
                stats,
            });
        });

        try {
            await this.topTraderRepository.save(traderEntities);
            console.log(`Saved ${traderEntities.length} top traders for token ${tokenId}`);
        } catch (error) {
            console.error(`Error saving top traders for token ${tokenId}:`, error.message);
        }
    }

    async fetchTopTraders(address: string, maxTraders: number): Promise<any[]> {
        const traders = [];
        let cursor: string | null = null;

        try {
            do {
                const url = `https://app.interface.social/api/token/8453/${address}/pnl?cursor=${cursor || ''}`;
                const response = await axios.get(url);

                if (response.status === 200 && response.data.traders) {
                    traders.push(...response.data.traders);
                    cursor = response.data.cursor;

                    if (traders.length >= maxTraders) {
                        break;
                    }
                } else {
                    break;
                }
            } while (cursor);

            return traders.slice(0, maxTraders);
        } catch (error) {
            console.error(`Error fetching top traders for address: ${address}:`, error.message);
            return [];
        }
    }

    async fetchTopHolders(address: string, maxHolders: number): Promise<any[]> {
        const holders = [];
        let cursor: string | null = null;

        try {
            do {
                const url = `https://app.interface.social/api/token/8453/${address}/holders?cursor=${cursor || ''}`;
                const response = await axios.get(url);

                if (response.status === 200 && response.data.holders) {
                    holders.push(...response.data.holders);
                    cursor = response.data.cursor;

                    if (holders.length >= maxHolders) {
                        break;
                    }
                } else {
                    break;
                }
            } while (cursor);

            return holders.slice(0, maxHolders);
        } catch (error) {
            console.error(`Error fetching top holders for address: ${address}:`, error.message);
            return [];
        }
    }
    async processTopHoldersForAllTokens(): Promise<void> {
        const limit = pLimit(5);

        try {
            const tokens = await this.tokenRepository.find();

            console.log(`Found ${tokens.length} tokens. Processing holders with concurrency limit...`);

            const processingTasks = tokens.map((token) =>
                limit(async () => {
                    try {
                        console.log(`Processing top holders for token: ${token.symbol} (${token.address})`);
                        await this.saveTopHolders(token.address, token.id);
                        console.log(`Top holders for token ${token.symbol} processed successfully.`);
                    } catch (error) {
                        console.error(`Error processing top holders for token ${token.symbol}:`, error.message);
                    }
                }),
            );

            await Promise.all(processingTasks);

            console.log('Processing of all top holders completed.');
        } catch (error) {
            console.error('Error processing top holders:', error.message);
        }
    }

    async saveTopHolders(address: string, tokenId: string): Promise<void> {
        const maxHolders = 60;
        const holders = await this.fetchTopHolders(address, maxHolders);

        await this.topHolderRepository.delete({ tokenId });

        const holderEntities = holders.map((holder) => {
            const { address: userAddress, balance } = holder;

            return this.topHolderRepository.create({
                tokenId,
                userAddress,
                context: { balance },
            });
        });

        try {
            await this.topHolderRepository.save(holderEntities);
            console.log(`Saved ${holderEntities.length} top holders for token ${tokenId}`);
        } catch (error) {
            console.error(`Error saving top holders for token ${tokenId}:`, error.message);
        }
    }

    async saveTop24hTokens(tokens: any[]): Promise<void> {
        console.log('Saving Top 24h Tokens to DB...');

        try {
            await this.top24hTokenRepository.query(`TRUNCATE TABLE top24h_tokens`);

            const tokenEntities = tokens.map((token) => {
                return this.top24hTokenRepository.create({
                    address: token.asset.address,
                    chainId: token.asset.chainId,
                    name: token.asset.name,
                    symbol: token.asset.symbol,
                    imageUrl: token.asset.imageUrl || null,
                    totalSupply: token.asset.totalSupply,
                    priceUSD: parseFloat(token.market.priceUSD),
                    marketCap: parseFloat(token.market.marketCap),
                    liquidity: parseFloat(token.market.liquidity),
                    volume24: parseFloat(token.market.volume24),
                    holders: token.market.holders,
                    createdAt: new Date(token.market.createdAt * 1000),
                });
            });

            await this.top24hTokenRepository.save(tokenEntities);

            console.log(`Successfully saved ${tokens.length} Top 24h Tokens.`);
        } catch (error) {
            console.error('Error saving Top 24h Tokens:', error.message);
        }
    }
}

