import { LocalizedString } from '@/translations/types';

export interface MessagingPayload {
  /**
   * The Title of the message
   */
  title: string;

  /**
   * The body of the message
   */
  body?: string | null;

  /**
   * Optional semantic label for the notification (e.g. 'new_message', 'friend_request')
   */
  type?: string | null;

  /**
   * Arbitrary additional structured data (e.g. IDs, links, flags)
   */
  data?: Record<string, any> | null;
}

export interface I18nMessagingPayload {
  /**
   * The title of the message
   * Can be a plain string or an i18n object
   */
  title: LocalizedString;

  /**
   * The body of the message
   * Can be a plain string, an i18n object, or null
   */
  body?: LocalizedString | null;

  /**
   * Optional semantic label for the notification (e.g. 'new_message', 'friend_request')
   */
  type?: string | null;

  /**
   * Arbitrary additional structured data (e.g. IDs, links, flags)
   */
  data?: Record<string, string> | null;
}
