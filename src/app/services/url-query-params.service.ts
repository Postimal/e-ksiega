import { Injectable, inject, Signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

export const QUERY_PARAM_GROUP_ID = 'group_id';
export const QUERY_PARAM_REDIRECT = 'redirect';

@Injectable({
  providedIn: 'root',
})
export class UrlQueryParamService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly groupIdParam: Signal<string | null>;

  constructor() {
    //TODO: imo jak sie to nam zapisze po raz pierwszy to niech sie zapisze do sessionStorage, i bede z sessionStorage czytał jako fallback
    this.groupIdParam = toSignal(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.getDeepestRoute(this.route)),
        map((activeRoute) => {
          const redirectParam = activeRoute.snapshot.queryParams[QUERY_PARAM_REDIRECT];
          return redirectParam
            ? this.resolveGroupIdParam(redirectParam)
            : activeRoute.snapshot.queryParams[QUERY_PARAM_GROUP_ID] || null;
        }),
      ),
      {
        initialValue:
          this.getDeepestRoute(this.route).snapshot.queryParams[QUERY_PARAM_GROUP_ID] || null,
      },
    );
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private resolveGroupIdParam(url: string) {
    const urlTree = this.router.parseUrl(url);
    const groupId = urlTree.queryParams[QUERY_PARAM_GROUP_ID];

    return groupId;
  }
}
