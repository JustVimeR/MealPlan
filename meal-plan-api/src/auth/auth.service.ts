import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../users/dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
      calorieTarget: dto.calorieTarget,
      roles: [],
    });
    const payload = { sub: String(user._id), email: user.email };
    return { accessToken: await this.jwt.signAsync(payload) };
  }

  async login(email: string, password: string) {
    const u = await this.users.findByEmail(email);
    if (!u) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: String(u._id), email: u.email };
    return { accessToken: await this.jwt.signAsync(payload) };
  }
}
