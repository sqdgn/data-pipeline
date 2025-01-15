import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalToken } from './token.entity';
import axios from 'axios';
import { TopTrader } from './top.traders.entity';
const pLimit = require('p-limit');


@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(GlobalToken)
        private readonly tokenRepository: Repository<GlobalToken>,
        @InjectRepository(TopTrader)
        private readonly topTraderRepository: Repository<TopTrader>,
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

}

