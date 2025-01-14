import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
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

      if (existingUser) {
        console.log(`User already exists: ${address}`);
        continue;
      }

      const newUser = new User();
      newUser.address = address;
      newUser.fullDomain = user.user?.fullDomain || '';
      newUser.avatar = user.user?.avatar || '';
      newUser.description = user.user?.description || '';

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
      (await this.tradeRepository.find({ where: { userId: user.id } }))
        .map((trade) => trade.tokenAddress),
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
        console.error(`Failed to save trade for token ${trade.token.address}: ${error.message}`);
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
    });

    const validActivities = [];

    for (const activity of activities) {
      if (activity.tokens && Array.isArray(activity.tokens) && activity.tokens.length === 2) {
        const [fromToken, toToken] = activity.tokens;

        const fromAmountUsd = parseFloat(fromToken['amountUsd'][0]?.replace(',', '') || '0');
        const toAmountUsd = parseFloat(toToken['amountUsd'][0]?.replace(',', '') || '0');

        const profit = toAmountUsd - fromAmountUsd;
        const profitPercentage = fromAmountUsd > 0 ? (profit / fromAmountUsd) * 100 : 0;

        if (
          (profit > 400 && profitPercentage > 50) ||
          (profit > 500 && profitPercentage > 20) ||
          (profit > 1000 && profitPercentage > 10)
        ) {
          console.log(`Profit is good: ${activity.id}. Profit: ${profit}. Percentage: ${profitPercentage}`);
          validActivities.push({ activity, profit, profitPercentage });
        }

        if (validActivities.length >= 30) {
          break;
        }
      }
    }

    for (const { activity, profit, profitPercentage } of validActivities) {
      const existingQueueEntry = await this.queueRepository.findOne({
        where: { activityId: activity.id },
      });

      if (existingQueueEntry) {
        console.log(`Queue entry already exists for activityId: ${activity.id}. Skipping.`);
        continue;
      }

      const [fromToken, toToken] = activity.tokens;

      const fromAmountUsd = parseFloat(fromToken['amountUsd'][0]?.replace(',', '') || '0');
      const toAmountUsd = parseFloat(toToken['amountUsd'][0]?.replace(',', '') || '0');

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
      newQueueEntry.fromTokenAmountUsd = fromAmountUsd;
      newQueueEntry.fromTokenIsPositive = fromToken['isPositive'] || null;

      newQueueEntry.toTokenAddress = toToken['address'] || null;
      newQueueEntry.toTokenChainId = toToken['chainId'] || null;
      newQueueEntry.toTokenImage = toToken['image'] || null;
      newQueueEntry.toTokenName = toToken['name'] || null;
      newQueueEntry.toTokenSymbol = toToken['symbol'] || null;
      newQueueEntry.toTokenAmount = parseFloat(toToken['amount'][0]?.replace(',', '') || '0');
      newQueueEntry.toTokenAmountUsd = toAmountUsd;
      newQueueEntry.toTokenIsPositive = toToken['isPositive'] || null;

      newQueueEntry.profit = profit;
      newQueueEntry.profitPercentage = profitPercentage;

      newQueueEntry.processed = false;

      await this.queueRepository.save(newQueueEntry);
      console.log(`Queue entry saved for activityId: ${activity.id}.`);
    }

    console.log('Queue data saved successfully.');
  }

  async saveQueueDataForUser(userId: number): Promise<void> {
    console.log(`saveQueueDataForUser: Processing userId = ${userId}`);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);


    const activities = await this.activityRepository.find({
      where: {
        userId: userId,
        methodName: 'Swapped',
        date: MoreThan(yesterday),
      },
      order: { date: 'DESC' },
    });
    console.log(`Found ${activities.length} swapped activities for userId=${userId}`);

    const validActivities = [];

    for (const activity of activities) {
      if (activity.tokens && Array.isArray(activity.tokens) && activity.tokens.length === 2) {
        const [fromToken, toToken] = activity.tokens;

        const fromAmountUsd = parseFloat(fromToken['amountUsd'][0]?.replace(',', '') || '0');
        const toAmountUsd = parseFloat(toToken['amountUsd'][0]?.replace(',', '') || '0');

        const profit = toAmountUsd - fromAmountUsd;
        const profitPercentage = fromAmountUsd > 0 ? (profit / fromAmountUsd) * 100 : 0;

        if (
          (profit > 400 && profitPercentage > 50) ||
          (profit > 500 && profitPercentage > 20) ||
          (profit > 1000 && profitPercentage > 10)
        ) {
          console.log(
            `Profit is good for activityId=${activity.id}. Profit=${profit}, Percentage=${profitPercentage}`,
          );
          validActivities.push({ activity, profit, profitPercentage });
        }

        if (validActivities.length >= 30) {
          break;
        }
      }
    }

    await Promise.all(
      validActivities.map(async ({ activity, profit, profitPercentage }) => {
        const existingQueueEntry = await this.queueRepository.findOne({
          where: { activityId: activity.id },
        });

        if (existingQueueEntry) {
          console.log(`Queue entry already exists for activityId: ${activity.id}. Skipping.`);
          return;
        }

        const [fromToken, toToken] = activity.tokens;

        const fromAmountUsd = parseFloat(fromToken['amountUsd'][0]?.replace(',', '') || '0');
        const toAmountUsd = parseFloat(toToken['amountUsd'][0]?.replace(',', '') || '0');

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
        newQueueEntry.fromTokenAmountUsd = fromAmountUsd;
        newQueueEntry.fromTokenIsPositive = fromToken['isPositive'] || null;

        newQueueEntry.toTokenAddress = toToken['address'] || null;
        newQueueEntry.toTokenChainId = toToken['chainId'] || null;
        newQueueEntry.toTokenImage = toToken['image'] || null;
        newQueueEntry.toTokenName = toToken['name'] || null;
        newQueueEntry.toTokenSymbol = toToken['symbol'] || null;
        newQueueEntry.toTokenAmount = parseFloat(toToken['amount'][0]?.replace(',', '') || '0');
        newQueueEntry.toTokenAmountUsd = toAmountUsd;
        newQueueEntry.toTokenIsPositive = toToken['isPositive'] || null;

        newQueueEntry.profit = profit;
        newQueueEntry.profitPercentage = profitPercentage;
        newQueueEntry.processed = false;

        await this.queueRepository.save(newQueueEntry);
        console.log(`Queue entry saved for activityId: ${activity.id}`);
      }),
    );

    console.log(`Queue data saved successfully for userId=${userId}.`);
  }

}