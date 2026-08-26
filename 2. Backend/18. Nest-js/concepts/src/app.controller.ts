import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  //AppService is injected through the constructor
  //constructor based dependency injection
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    //using the injected service to get the gethello method
    return this.appService.getHello();
  }
}
