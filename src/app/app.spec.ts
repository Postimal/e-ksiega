import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { UrlQueryParamService } from './services/url-query-params.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

describe('UrlQueryParamService', () => {
  let service: UrlQueryParamService;

  beforeEach(() => {
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [UrlQueryParamService],
    });
    service = TestBed.inject(UrlQueryParamService);
  });

  it('should read params from URL and save them to sessionStorage', () => {
    window.history.pushState({}, '', '/?group_id=group-42&variant=wesele');

    service.init();

    expect(service.groupIdParam()).toBe('group-42');
    expect(service.variantParam()).toBe('wesele');
    expect(JSON.parse(sessionStorage.getItem('e-ksiega-query-params') ?? '{}')).toEqual({
      group_id: 'group-42',
      variant: 'wesele',
    });
  });

  it('should restore params from sessionStorage when URL has no params', () => {
    sessionStorage.setItem(
      'e-ksiega-query-params',
      JSON.stringify({ group_id: 'group-99', variant: 'chrzest' }),
    );

    service.init();

    expect(service.groupIdParam()).toBe('group-99');
    expect(service.variantParam()).toBe('chrzest');
  });
});
