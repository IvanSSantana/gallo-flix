import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { MediaSummary, MediaType, TmdbListResponse } from '../../models/tmdb.models';
import { MovieApiService } from '../../services/movie-api.service';

type SearchMedia = MediaSummary & { media_type: MediaType };

interface SearchState {
  query: string;
  page: number;
  response: TmdbListResponse<MediaSummary> | null;
}

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private readonly movieApi = inject(MovieApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private loadedQuery = '';

  readonly searchQuery = signal('');
  readonly resultsList = signal<SearchMedia[]>([]);
  readonly totalResults = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly hasSearched = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((params) => {
          const query = (params.get('query') ?? '').trim();
          const parsedPage = Number(params.get('page'));
          const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

          this.searchQuery.set(query);
          this.currentPage.set(page);

          if (!query) {
            this.resultsList.set([]);
            this.totalResults.set(0);
            this.totalPages.set(0);
            this.hasSearched.set(false);
            return of<SearchState>({ query, page, response: null });
          }

          return this.movieApi.searchMedia(query, page).pipe(
            map((response) => ({ query, page, response } satisfies SearchState)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ query, page, response }) => {
        if (!response) {
          return;
        }

        this.hasSearched.set(true);
        this.totalResults.set(response.total_results);
        this.totalPages.set(response.total_pages);

        if (page === 1 || query !== this.loadedQuery) {
          this.resultsList.set(this.filterSearchableMedia(response.results));
        } else {
          this.resultsList.update((current) => [
            ...current,
            ...this.filterSearchableMedia(response.results),
          ]);
        }

        this.loadedQuery = query;
      });
  }

  onSearch(): void {
    const query = this.searchQuery().trim();

    if (!query) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { query, page: 1 },
    });
  }

  private filterSearchableMedia(items: MediaSummary[]): SearchMedia[] {
    return items.filter(
      (item): item is SearchMedia =>
        item.media_type === 'movie' || item.media_type === 'tv',
    );
  }

  loadMore(): void {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query: this.searchQuery().trim(),
        page: this.currentPage() + 1,
      },
    });
  }
}