import { Injectable, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export const QUERY_PARAM_GROUP_ID = 'group_id';
export const QUERY_PARAM_REDIRECT = 'redirect';
export const QUERY_PARAM_VARIANT = 'variant';

@Injectable({
  providedIn: 'root',
})
export class UrlQueryParamService {
  groupIdParam = signal('');
  variantParam = signal('');

  // TODO: dane jak jakies teskty to moge brac z DB np jakies imiona i date
  init(): void {
    const urlParams = new URLSearchParams(window.location.search);

    const redirectParam = urlParams.get(QUERY_PARAM_REDIRECT);

    if (redirectParam) {
      this.variantParam.set(
        this.resolveParamFromNestedQueryParam(redirectParam, QUERY_PARAM_VARIANT) ?? '',
      );
      this.groupIdParam.set(
        this.resolveParamFromNestedQueryParam(redirectParam, QUERY_PARAM_GROUP_ID) ?? '',
      );
    } else {
      this.variantParam.set(urlParams.get(QUERY_PARAM_VARIANT) ?? '');
      this.groupIdParam.set(urlParams.get(QUERY_PARAM_GROUP_ID) ?? '');
    }

    if (!this.variantParam()) {
      this.variantParam.set('chrzest');
    }

    if (!this.groupIdParam()) {
      this.groupIdParam.set('');
    }

    console.log('Ustalone dane wariantu na starcie:', this.variantParam());
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
