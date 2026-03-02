import type {RedisClientOptions} from "redis";
import {createClient} from "redis";

/**
 * @file redis.types.ts
 * @summary Типи для Redis-конфігурації та Redis client у застосунку.
 */

/**
 * Базова конфігурація Redis для створення client + службові параметри застосунку.
 */
export type BaseConfig = {
    /** maxReconnectRetries - скільки разів дозволяємо reconnectStrategy повертати retry delay */
    maxReconnectRetries?: number;
    /** keyPrefix - Префікс який буде додаватись до кожного ключа (Не залежить від сервісу)*/
    keyPrefix: string;
    /** clientOptions - Базові налаштування конфігурації для Redis */
    clientOptions: RedisClientOptions;
};

/**
 * Конфіг Redis саме для сесій Telegraf.
 * Розширює базовий конфіг TTL-параметрами для session store.
 */
export type SessionConfig = BaseConfig & {
    /** Час життя ключа сесії у Redis (секунди). */
    sessionTTL: number;
    /** Інтервал "touch" без повного перезапису сесії (секунди). */
    touchAfter: number;
}

/**
 * Вхідні параметри для побудови базового Redis-конфігу.
 */
export interface ParamsForBaseConfig {
    /** host - Хост до контейнера чи сервера Redis */
    host: string;
    /** port - Порт до Redis */
    port: number;
    /** name - Імʼя інстансу */
    name:string;
    /** password - Пароль для Redis */
    password?: string;
    /** database - Номер бази зазвичай 0 (0-15) */
    database?: number;
    /** keyPrefix - Ключ додаватиметься до кожного ключа (Залежить від сервісу) */
    keyPrefix: string;
    /** maxReconnectRetries - Кількість повторів при reconnect */
    maxReconnectRetries?: number;
}

/**
 * Точний тип Redis client, який повертає `createClient(...)` у поточному проєкті.
 * Використовуємо `ReturnType`, щоб уникнути конфліктів generic-типів RedisClientType.
 */
export type RedisClient = ReturnType<typeof createClient>;
