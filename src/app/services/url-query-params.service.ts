import { Injectable, signal } from '@angular/core';

export const QUERY_PARAM_GROUP_ID = 'group_id';
export const QUERY_PARAM_REDIRECT = 'redirect';
export const QUERY_PARAM_VARIANT = 'variant';

const QUERY_PARAMS_STORAGE_KEY = 'e-ksiega-query-params';

interface QueryParamsState {
  group_id: string;
  variant: string;
}

@Injectable({
  providedIn: 'root',
})
export class UrlQueryParamService {
  groupIdParam = signal('');
  variantParam = signal('');

  init(): void {
    const urlParams = this.readParamsFromUrl();
    const sessionParams = this.readParamsFromSessionStorage();
    const params = this.hasUrlParams(urlParams) ? urlParams : (sessionParams ?? urlParams);

    this.groupIdParam.set(params.group_id);
    this.variantParam.set(params.variant);
    this.persistParamsToSessionStorage(params);
  }

  private readParamsFromSessionStorage(): QueryParamsState | null {
    try {
      const serializedParams = sessionStorage.getItem(QUERY_PARAMS_STORAGE_KEY);
      if (!serializedParams) {
        return null;
      }

      const parsed = JSON.parse(serializedParams) as Partial<QueryParamsState>;
      if (!parsed) {
        return null;
      }

      return {
        group_id: parsed.group_id ?? '',
        variant: parsed.variant ?? 'chrzest',
      };
    } catch {
      return null;
    }
  }

  private readParamsFromUrl(): QueryParamsState {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get(QUERY_PARAM_REDIRECT);

    const variantFromUrl = redirectParam
      ? this.resolveParamFromNestedQueryParam(redirectParam, QUERY_PARAM_VARIANT)
      : urlParams.get(QUERY_PARAM_VARIANT);

    const groupIdFromUrl = redirectParam
      ? this.resolveParamFromNestedQueryParam(redirectParam, QUERY_PARAM_GROUP_ID)
      : urlParams.get(QUERY_PARAM_GROUP_ID);

    return {
      group_id: groupIdFromUrl ?? '',
      variant: variantFromUrl ?? 'chrzest',
    };
  }

  private persistParamsToSessionStorage(params: QueryParamsState): void {
    try {
      sessionStorage.setItem(
        QUERY_PARAMS_STORAGE_KEY,
        JSON.stringify(this.normalizeParams(params)),
      );
    } catch {
      // sessionStorage may be unavailable in some environments, so we intentionally ignore it.
    }
  }

  private hasUrlParams(params: QueryParamsState): boolean {
    return Boolean(params.group_id || params.variant !== 'chrzest');
  }

  private normalizeParams(params: QueryParamsState): QueryParamsState {
    return {
      group_id: params.group_id ?? '',
      variant: params.variant || 'chrzest',
    };
  }

  private resolveParamFromNestedQueryParam(redirectUrl: string, paramName: string): string | null {
    try {
      const parser = new URLSearchParams(
        redirectUrl.includes('?') ? redirectUrl.split('?')[1] : redirectUrl,
      );
      return parser.get(paramName);
    } catch {
      return null;
    }
  }
}
