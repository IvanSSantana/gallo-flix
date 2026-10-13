import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AutoScrollDirective } from '../../directives/auto-scroll.directive';
import { MediaSummary } from '../../models/tmdb.models';
import { MovieApiService } from '../../services/movie-api.service';

@Component({
  selector: 'app-home',
  imports: [AutoScrollDirective, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly movieApi = inject(MovieApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bannerResults = signal<MediaSummary[]>([]);
  readonly trendingMovieResults = signal<MediaSummary[]>([]);
  readonly trendingSerieResults = signal<MediaSummary[]>([]);
  readonly popularActionMovieResults = signal<MediaSummary[]>([]);

  ngOnInit(): void {
    forkJoin({
      banner: this.movieApi.bannerApiData().pipe(
        map((response) => response.results),
        catchError(() => of([] as MediaSummary[])),
      ),
      movies: this.movieApi.trendingMovieApiData().pipe(
        map((response) => response.results),
        catchError(() => of([] as MediaSummary[])),
      ),
      series: this.movieApi.trendingSerieApiData().pipe(
        map((response) => response.results),
        catchError(() => of([] as MediaSummary[])),
      ),
      actionMovies: this.movieApi.popularActionMovieApiData().pipe(
        map((response) => response.results),
        catchError(() => of([] as MediaSummary[])),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ banner, movies, series, actionMovies }) => {
        this.bannerResults.set(banner);
        this.trendingMovieResults.set(movies);
        this.trendingSerieResults.set(series);
        this.popularActionMovieResults.set(actionMovies);
      });
  }
}