import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalToken } from './token.entity';

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

        if (!id) {
            console.log(`Skipping invalid token data: ${JSON.stringify(tokenData)}`);
            return;
        }

        const newToken = this.tokenRepository.create({
            id,
            chainId,
            title,
            symbol,
            address,
            totalSupply: totalSupply ? parseFloat(totalSupply) : null,
            decimals,
            image,
            creatorAddress: by?.address || null,
            created: created ? new Date(created) : null,
            contractAddress: contract?.address || null,
            contractDeploymentHash: contract?.deploymentHash || null,
            chainName: chain?.name || null,
            chainImage: chain?.image || null,
            chainUrl: chain?.url || null,
            socials,
        });

        try {
            await this.tokenRepository.save(newToken);
            console.log(`Token ${symbol} saved successfully.`);
        } catch (error) {
            console.error(`Error saving token ${symbol}:`, error.message);
        }
    }
}
