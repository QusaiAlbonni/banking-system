import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class CoreController {
  @Get()
  @Render('home.njk')
  getHome() {
    return { welcomePhrase: 'Welcome to our banking app!' };
  }

  @Get('example')
  @Render('example.njk')
  getExample() {
    return { welcomePhrase: 'Welcome to our banking app (Example)!' };
  }
}
