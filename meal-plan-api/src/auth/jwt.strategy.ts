import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategyBase } from 'passport-jwt';
import type { Request } from 'express';

export type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor() {
    const jwtFromRequest = (req: Request): string | null => {
      const auth = req?.headers?.authorization;
      if (!auth) return null;
      const [scheme, token] = auth.split(' ');
      return scheme === 'Bearer' && token ? token : null;
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest,
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_change_me',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return { sub: payload.sub, email: payload.email };
  }
}
