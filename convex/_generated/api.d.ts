/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as books from "../books.js";
import type * as chat from "../chat.js";
import type * as dailyVerses from "../dailyVerses.js";
import type * as devotions from "../devotions.js";
import type * as dictionary from "../dictionary.js";
import type * as kjv from "../kjv.js";
import type * as payments from "../payments.js";
import type * as queryLimits from "../queryLimits.js";
import type * as querySuggestions from "../querySuggestions.js";
import type * as users from "../users.js";
import type * as writer from "../writer.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  books: typeof books;
  chat: typeof chat;
  dailyVerses: typeof dailyVerses;
  devotions: typeof devotions;
  dictionary: typeof dictionary;
  kjv: typeof kjv;
  payments: typeof payments;
  queryLimits: typeof queryLimits;
  querySuggestions: typeof querySuggestions;
  users: typeof users;
  writer: typeof writer;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
