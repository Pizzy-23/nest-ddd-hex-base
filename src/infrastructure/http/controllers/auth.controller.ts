import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { LoginDto } from '../../../application/modules/auth/dtos/login.dto';
import { LoginUseCase } from '../../../application/modules/auth/use-cases/login.use-case';
import { Response } from 'express';
import { ResponseUtil } from '../../common/utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.loginUseCase.execute(dto);
    res.status(HttpStatus.OK).json(ResponseUtil.success(result, 'Login realizado com sucesso.'));
  }
}
