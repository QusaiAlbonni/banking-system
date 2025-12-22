import { Controller, Get, Render } from "@nestjs/common";

@Controller('')
export class AuthViewsController {

  @Render('login.njk')
  @Get('login')
  async login(){

  }
}