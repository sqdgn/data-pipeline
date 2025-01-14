import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalToken } from './token.entity';
import axios from 'axios';


@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(GlobalToken)
        private readonly tokenRepository: Repository<GlobalToken>,
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
            console.log(`Skipping invalid token data: ${JSON.stringify(tokenData)}`);
            return;
        }

        const scrapedData = await this.scrapeTokenMetrics(address);

        const newToken = this.tokenRepository.create({
            id,
            chainId,
            title,
            symbol,
            address,
            totalSupply: totalSupply && !isNaN(parseFloat(totalSupply)) ? parseFloat(totalSupply) : null,
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
}
