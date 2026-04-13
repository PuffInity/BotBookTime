/**
 * @file requestId.utils.ts
 * @summary uk: AsyncLocalStorage контекст requestId.
 * en: AsyncLocalStorage context for requestId.
 * cz: AsyncLocalStorage kontext pro requestId.
 */
import {AsyncLocalStorage} from "node:async_hooks";

/**
 * uk: Тип контексту
 * en: Context type
 * cz: Typ kontextu
 */
export type Context = { requestId?: string};

/** uk: ALS сховище | en: ALS storage | cz: ALS úložiště */
const storage = new AsyncLocalStorage<Context>();

/**
 * uk: API контексту
 * en: Context API
 * cz: API kontextu
 */
export const RequestContext = {
    /**
     * uk: Запуск у контексті
     * en: Run in context
     * cz: Spustit v kontextu
     */
    run<T>(ctx: Context, cb: () => T):T {
        return storage.run(ctx, cb);
    },

    /**
     * uk: Отримати контекст
     * en: Get context
     * cz: Získat kontext
     */
    get(): Context {
        return storage.getStore() ?? {}
    },

    /**
     * uk: Отримати request id
     * en: Get request id
     * cz: Získat request id
     */
    getRequestId(): string | undefined {
        return storage.getStore()?.requestId;
    }
}
