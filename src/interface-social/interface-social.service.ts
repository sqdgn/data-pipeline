import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import * as cron from 'node-cron';
import { lastValueFrom } from 'rxjs';
import { ActivityEntity } from '../user/activity.entity';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class InterfaceSocialService implements OnModuleInit {

	constructor(
		private readonly userService: UserService,
		private readonly httpService: HttpService,
	  ) {}

	  async fetchUserActivity(address: string): Promise<ActivityEntity[]> {
		const url = `https://app.interface.social/api/profile/${address}/activity`;
		console.log(`Fetching activity for address: ${address}`);

		try {
		  const response = await lastValueFrom(this.httpService.get(url));
		  console.log('Response data:', response.data);

		  const { txs } = response.data;
		  return txs.map((tx: any) => ({
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

		} catch (error) {
		  console.error(`Error fetching activity for address ${address}:`, error.message);
		  throw error;
		}
	  }



	async getLeaderboard() {
		try {
		// new
		const url = 'https://app.interface.social/api/leaderboard?limit=75&offset=0';
		const headers = {
			'accept': '*/*',
			'accept-language': 'en',
			'content-type': 'application/json',
			'cookie': 'wagmi.store={"state":{"connections":{"__type":"Map","value":[]},"chainId":1,"current":null},"version":2}; i18next=en; ph_phc_ytp0VTJmi6l4gD2KiNBCO3kCetLE8K1scXWgsSqLMss_posthog=%7B%22distinct_id%22%3A%220193df79-07c5-7b2a-980f-a8cfa719bf4e%22%2C%22%24sesid%22%3A%5B1734877195433%2C%220193eeba-cd7c-7217-aa46-19f06f7180de%22%2C1734877039996%5D%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fapp.interface.social%2Fleaderboard%22%7D%7D',
			'priority': 'u=1, i',
			'referer': 'https://app.interface.social/leaderboard',
			'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"macOS"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-origin',
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
		};

		console.log('Fetching leaderboard...');
		const response = await axios.get(url, { headers });
		console.log('Leaderboard Data fetched successfully');

		return response.data;
		} catch (error) {
		  throw new Error(`Failed to fetch leaderboard: ${error.message}`);
		}
	  }

	  async getUsersFromLeaderboardAndSaveIt() {
		const usersLeaderboard = await this.getLeaderboard();
		const savedUsers = await this.userService.saveUsers(usersLeaderboard);
		console.log('Users saved successfully:', usersLeaderboard.length);

		return savedUsers;
	  }

	  async fetchAndSaveUserTrades(user: User) {
		const address = user.address;
		if (!address) return;

		console.log('Fetching trades for user:', address);
		const url = `https://app.interface.social/api/profile/${address}/pnl`;
		const response = await axios.get(url);

		const trades = response.data;
		await this.userService.saveTrades(user, trades);
		console.log('Trades saved successfully:', trades.length);
	  }

	  async runTasks() {
		  let users = await this.userService.getUsers();

		  if (!users.length) {
			  console.log('No users found in the database. Fetching from Interface Social...');
			  users = await this.getUsersFromLeaderboardAndSaveIt();
		  }

		  console.log('Users fetched from the database:', users.length);

		  for (const user of users) {
			await this.fetchAndSaveUserTrades(user);

			console.log(`Fetching activity for user: ${user.address}`);
			const activities = await this.fetchUserActivity(user.address);

			if (activities.length > 0) {
			console.log(`Saving ${activities.length} activities for user: ${user.address}`);
			await this.userService.saveActivities(user.address, activities);
			} else {
			console.log(`No activities found for user: ${user.address}`);
			}
		  }
		  console.log('Saving queue data...');
  		  await this.userService.saveQueueData();
	  }

	  async onModuleInit() {
		// Run the task immediately
		console.log('Running initial tasks...');
		await this.runTasks();

		// Schedule the task to run every hour
		cron.schedule('0 * * * *', async () => {
		  console.log('Running scheduled tasks...');
		  await this.runTasks();
		});
	  }

}