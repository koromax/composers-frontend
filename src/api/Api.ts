/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsComposer {
  creator_id?: number;
  current_user_is_creator?: boolean;
  current_user_liked?: boolean;
  date_create?: string;
  date_formed?: string;
  description?: string;
  freq1?: number;
  freq2?: number;
  id?: number;
  image_url?: string;
  likes_count?: number;
  name?: string;
  status?: string;
  video_url?: string;
}

export interface HandlerLoginReq {
  login: string;
  password: string;
}

export interface HandlerRegisterReq {
  login: string;
  password: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "//127.0.0.1:8080/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Composers API
 * @version 1.0
 * @baseUrl //127.0.0.1:8080/api
 * @contact
 *
 * Backend API for Composers SPA (LR4)
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  composer = {
    /**
     * No description
     *
     * @tags composers
     * @name ComposerCreate
     * @summary Создание черновика композитора
     * @request POST:/composer
     * @secure
     */
    composerCreate: (
      data: {
        /** Имя композитора */
        name: string;
        /**
         * Изображение
         * @format binary
         */
        pic?: File;
        /**
         * Видео
         * @format binary
         */
        video?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsComposer, any>({
        path: `/composer`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags composers
     * @name DraftList
     * @summary Получение черновика композитора
     * @request GET:/composer/draft
     * @secure
     */
    draftList: (params: RequestParams = {}) =>
      this.request<DsComposer, any>({
        path: `/composer/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает число лайков и признак лайка текущего пользователя. Bearer-токен необязателен.
     *
     * @tags composers
     * @name FeedList
     * @summary Получение ленты композиторов
     * @request GET:/composer/feed
     * @secure
     */
    feedList: (
      query?: {
        /** Текущий ID */
        id?: number;
        /** Запрос далее */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsComposer, any>({
        path: `/composer/feed`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags composers
     * @name ComposerDelete
     * @summary Удаление композитора
     * @request DELETE:/composer/{id}
     * @secure
     */
    composerDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/composer/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags composers
     * @name LikeCreate
     * @summary Лайк/Дизлайк композитора
     * @request POST:/composer/{id}/like
     * @secure
     */
    likeCreate: (
      id: number,
      data: {
        /** Значение лайка */
        like: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/composer/${id}/like`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags composers
     * @name PublishUpdate
     * @summary Публикация черновика композитора
     * @request PUT:/composer/{id}/publish
     * @secure
     */
    publishUpdate: (
      id: number,
      data: {
        /** Описание */
        description?: string;
        /** Частота 1 */
        freq1?: number;
        /** Частота 2 */
        freq2?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/composer/${id}/publish`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),
  };
  composers = {
    /**
     * @description Возвращает число лайков и признак лайка текущего пользователя. Bearer-токен необязателен.
     *
     * @tags composers
     * @name ComposersList
     * @summary Получение списка опубликованных композиторов
     * @request GET:/composers
     * @secure
     */
    composersList: (
      query?: {
        /** Минимальная частота */
        min_freq?: number;
        /** Максимальная частота */
        max_freq?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsComposer[], any>({
        path: `/composers`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  user = {
    /**
     * No description
     *
     * @tags auth
     * @name LoginCreate
     * @summary Авторизация (вход)
     * @request POST:/user/login
     */
    loginCreate: (input: HandlerLoginReq, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/user/login`,
        method: "POST",
        body: input,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name LogoutCreate
     * @summary Выход (деавторизация)
     * @request POST:/user/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/user/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name RegisterCreate
     * @summary Регистрация пользователя
     * @request POST:/user/register
     */
    registerCreate: (input: HandlerRegisterReq, params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/user/register`,
        method: "POST",
        body: input,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
