import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Trade } from './trade.entity';
import { ActivityEntity } from './activity.entity';
import { Queue } from './queue.entity';


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
    const existingTrades = new Set(
      (await this.tradeRepository.find({ where: { userId: user.id } }))
        .map((trade) => trade.tokenAddress),
    );

    for (const trade of trades) {
      try {
        if (existingTrades.has(trade.token.address)) {
          console.log(`Trade already exists for token ${trade.token.address}, skipping.`);
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
        console.error(`Failed to save trade for token ${trade.token.address}: ${error.message}`);
        continue;
      }
    }
  }

  async saveActivities(address: string, activities: any[]): Promise<void> {
    const now = Date.now();
    const fiveHoursAgo = now - 5 * 60 * 60 * 1000;
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
  async saveQueueData(): Promise<void> {
    const activities = await this.activityRepository.find({
      where: { methodName: 'Swapped' },
      order: { date: 'DESC' },
      take: 10,
    });

    for (const activity of activities) {
      if (activity.tokens && Array.isArray(activity.tokens) && activity.tokens.length === 2) {
        const [fromToken, toToken] = activity.tokens;

        const existingQueueEntry = await this.queueRepository.findOne({
          where: { activityId: activity.id },
        });

        if (existingQueueEntry) {
          console.log(`Queue entry already exists for activityId: ${activity.id}. Skipping.`);
          continue;
        }

        const newQueueEntry = new Queue();
        newQueueEntry.activityId = activity.id;
        newQueueEntry.date = activity.date;
        newQueueEntry.category = activity.category;
        newQueueEntry.chainName = activity.chainName || null;
        newQueueEntry.chainImage = activity.chainImage || null;
        newQueueEntry.methodName = activity.methodName || null;
        newQueueEntry.shareUrl = activity.shareUrl || null;
        newQueueEntry.userId = activity.userId;

        newQueueEntry.fromTokenChainId = fromToken['chainId'] || null;
        newQueueEntry.fromTokenImage = fromToken['image'] || null;
        newQueueEntry.fromTokenName = fromToken['name'] || null;
        newQueueEntry.fromTokenSymbol = fromToken['symbol'] || null;
        newQueueEntry.fromTokenAmount = parseFloat(fromToken['amount'][0]?.replace(',', '') || '0');
        newQueueEntry.fromTokenAmountUsd = parseFloat(fromToken['amountUsd'][0]?.replace(',', '') || '0');
        newQueueEntry.fromTokenIsPositive = fromToken['isPositive'] || null;

        newQueueEntry.toTokenAddress = toToken['address'] || null;
        newQueueEntry.toTokenChainId = toToken['chainId'] || null;
        newQueueEntry.toTokenImage = toToken['image'] || null;
        newQueueEntry.toTokenName = toToken['name'] || null;
        newQueueEntry.toTokenSymbol = toToken['symbol'] || null;
        newQueueEntry.toTokenAmount = parseFloat(toToken['amount'][0]?.replace(',', '') || '0');
        newQueueEntry.toTokenAmountUsd = parseFloat(toToken['amountUsd'][0]?.replace(',', '') || '0');
        newQueueEntry.toTokenIsPositive = toToken['isPositive'] || null;

        newQueueEntry.processed = false;

        await this.queueRepository.save(newQueueEntry);
        console.log(`Queue entry saved for activityId: ${activity.id}.`);
      } else {
        console.log(`Activity with ID ${activity.id} does not have exactly 2 tokens. Skipping.`);
      }
    }

    console.log('Queue data saved successfully.');
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

