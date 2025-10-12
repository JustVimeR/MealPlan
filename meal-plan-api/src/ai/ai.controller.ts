import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type { Request } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

type ChatRole = 'system' | 'user' | 'assistant';
type ChatMessage = { role: ChatRole; content: string };
type ChatDto = { messages: ChatMessage[] };

const DEFAULT_SYSTEM =
  'You are MealPlan AI. Help with recipes, meal planning, macros (kcal/P/F/C), and shopping. Answer briefly and use bullet points when appropriate.';

interface GeminiError extends Error {
  status?: number;
  code?: string;
  statusText?: string;
  error?: { code?: string; message?: string };
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  @Post('chat')
  async chat(@Req() _req: Request, @Body() dto: ChatDto) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GOOGLE_API_KEY is not configured on the server',
      );
    }

    const all = Array.isArray(dto?.messages) ? dto.messages : [];
    const systemMsg = all.find((m) => m.role === 'system');
    const history = all.filter((m) => m.role !== 'system').slice(-40);

    const totalChars = history.reduce(
      (n, m) => n + (m?.content?.length || 0),
      0,
    );
    if (totalChars > 20_000) {
      throw new HttpException(
        { ok: false, code: 'input_too_large', message: 'Input is too large' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemMsg?.content ?? DEFAULT_SYSTEM,
    });

    const contents = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    try {
      const result = await model.generateContent({ contents });
      const text =
        typeof result.response?.text === 'function'
          ? result.response.text()
          : 'Sorry, no response.';
      return { ok: true, text };
    } catch (err: unknown) {
      const e = err as GeminiError;
      const status = typeof e.status === 'number' ? e.status : 500;
      const code = e.code || e.error?.code || e.statusText || 'gemini_failed';
      const message =
        e.error?.message ||
        e.message ||
        'Gemini request failed. Please try again later.';

      if (status === 429 || status === 403) {
        throw new HttpException(
          {
            ok: false,
            code: 'rate_limited',
            message:
              'Gemini rate limit or quota exceeded. Try again later or check quota.',
          },
          status,
        );
      }

      throw new HttpException(
        { ok: false, code, message },
        status >= 400 ? status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
