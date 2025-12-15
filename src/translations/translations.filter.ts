import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { I18nErrorMessage } from './error-message';
import { makeAnother } from '@/common/utils';

@Catch()
export class I18nTranslationFilter<T>
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  constructor(private readonly i18nService: I18nService) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    if (!(exception instanceof HttpException)) {
      super.catch(exception, host);
      return;
    }
    const resp = exception.getResponse();
    const i18n = I18nContext.current(host);
    const lang = i18n?.lang;

    if (typeof resp !== 'string' && 'message' in resp) {
      if (Array.isArray(resp.message)) {
        const messages = resp.message.map((msg) => {
          if (msg instanceof I18nErrorMessage) {
            return this.i18nService.translate(msg.key, {
              lang,
              args: msg.args,
            });
          }
          return msg;
        });
        const translatedException = makeAnother(exception, messages);
        (translatedException as any).status = exception.getStatus();
        super.catch(translatedException, host);
        return;
      }
    }

    if (resp instanceof I18nErrorMessage) {
      const message = this.i18nService.translate(resp.key, {
        lang,
        args: resp.args,
      });
      const translatedException = makeAnother(exception, message);
      (translatedException as any).status = exception.getStatus();
      super.catch(translatedException, host);
      return;
    }

    super.catch(exception, host);
  }
}
