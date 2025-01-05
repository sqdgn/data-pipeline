import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Trade } from './trade.entity';
import { ActivityEntity } from './activity.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>,

    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
  ) {}

  async saveUsers(users: any[]): Promise<User[]> {
    const userEntities = users.map(({ user }) => {
      const newUser = new User();
      newUser.address = user.address;
      newUser.fullDomain = user.fullDomain || '';
      newUser.avatar = user.avatar;
      newUser.description = user.description || '';

      return newUser;
    });

    return await this.userRepository.save(userEntities);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async saveTrades(user: User, trades: any[]): Promise<void> {
    for (const trade of trades) {
      try {
        // Check if trade already exists (based on token address and user ID)
        const existingTrade = await this.tradeRepository.findOne({
          where: {
            tokenAddress: trade.token.address,
            userId: user.id,
          },
        });

        // Skip if trade already exists
        if (existingTrade) {
          console.log(`Trade already exists for token ${trade.token.address}, skipping.`);
          continue;
        }

        // Create and save new trade
        const newTrade = new Trade();
        newTrade.tokenAddress = trade.token.address;
        newTrade.chainId = trade.token.chainId;
        newTrade.decimals = trade.token.decimals;
        newTrade.name = trade.token.name;
        newTrade.symbol = trade.token.symbol;
        newTrade.imageUrl = trade.token.imageUrl;
        newTrade.totalSupply = trade.token.totalSupply;

        // Map stats fields
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
      } catch (error) {
        console.error(`Failed to save trade for token ${trade.token.address}: ${error.message}`);
        continue;
      }
    }
  }
  async saveActivities(address: string, activities: any[]): Promise<void> {
    for (const activity of activities) {
        try {
            const existingActivity = await this.activityRepository.findOne({
                where: { id: activity.id },
            });

            if (existingActivity) {
                console.log(`Activity already exists for ID ${activity.id}, skipping.`);
                continue;
            }
            const user = await this.userRepository.findOne({
              where: { address: activity.user?.address || address },
          });

          if (!user) {
              console.error(`User not found for address ${activity.user?.address || address}`);
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
        } catch (error) {
            console.error(`Failed to save activity with ID ${activity.id}: ${error.message}`);
            continue;
        }
    }
}


  async fetchAndSaveUserActivities(address: string): Promise<void> {
    const url = `https://app.interface.social/api/profile/${address}/activity`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.txs) {
        await this.saveActivities(address, data.txs);
      } else {
        console.log(`No activities found for address ${address}.`);
      }
    } catch (error) {
      console.error(`Failed to fetch activities for address ${address}: ${error.message}`);
    }
  }
}

