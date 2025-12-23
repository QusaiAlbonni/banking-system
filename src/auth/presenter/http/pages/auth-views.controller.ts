import { Controller, Get, Post, Render } from "@nestjs/common";

@Controller()
export class AuthViewsController {

  @Render('login.njk')
  @Get('login')
  async getLogin(){}

  @Post('login')
  async login(){}
}