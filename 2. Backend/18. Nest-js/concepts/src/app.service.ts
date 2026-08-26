import { Injectable } from '@nestjs/common';

//decorator
//business logics of your application
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Nest JS!';
  }
}
