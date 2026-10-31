import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				{ provide: AppService, useValue: { getHello: () => 'Hello World!' } },
			],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	it('returns the greeting', () => {
		expect(appController.getHello()).toBe('Hello World!');
	});

	it('reports health', () => {
		expect(appController.getHealth().status).toBe('ok');
	});
});
