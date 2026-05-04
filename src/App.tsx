import { FormEvent, PointerEvent, useMemo, useRef, useState } from 'react';
import { searchAddress } from './api';
import type { HistoryItem, ZipcloudResult } from './types';
import { validateZipcode } from './validation';

const NOT_FOUND_MESSAGE = '郵便番号が存在しません。';
const GENERAL_ERROR_MESSAGE = 'エラーが発生しました。';
const ITEMS_PER_PAGE = 3;

function formatAddress(result: ZipcloudResult) {
  return `${result.address1}${result.address2}${result.address3}`;
}

function formatKana(result: ZipcloudResult) {
  return `${result.kana1}${result.kana2}${result.kana3}`;
}

function chunkHistory(items: HistoryItem[]) {
  const pages: HistoryItem[][] = [];

  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }

  return pages;
}

function ResultList({ results, query }: { results: ZipcloudResult[]; query: string }) {
  return (
    <section className="result-panel" aria-labelledby="result-heading">
      <p className="result-panel__zipcode">郵便番号: {query}</p>
      <h2 id="result-heading" className="visually-hidden">
        検索結果
      </h2>
      <div className="result-list">
        {results.map((result) => (
          <article className="result-row" key={`${result.zipcode}-${result.address3}`}>
            <p>住所: {formatAddress(result)}</p>
            <p>カナ: {formatKana(result)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <article className="history-card">
      <p className="history-card__zipcode">郵便番号: {item.query}</p>
      <div className="history-card__results">
        {item.results.map((result) => (
          <div className="history-card__result" key={`${item.id}-${result.address3}`}>
            <p>住所: {formatAddress(result)}</p>
            <p>カナ: {formatKana(result)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function CarouselArrowIcon({ direction }: { direction: 'previous' | 'next' }) {
  const points = direction === 'previous' ? '15 4 7 12 15 20' : '9 4 17 12 9 20';

  return (
    <svg
      className="carousel-arrow"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points={points} />
    </svg>
  );
}

function HistoryCarousel({ items }: { items: HistoryItem[] }) {
  const [pageIndex, setPageIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const pages = useMemo(() => chunkHistory(items), [items]);
  const maxPage = Math.max(pages.length - 1, 0);

  if (items.length === 0) {
    return null;
  }

  const movePage = (nextPage: number) => {
    setPageIndex(Math.min(Math.max(nextPage, 0), maxPage));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) {
      return;
    }

    const diff = event.clientX - startX.current;
    startX.current = null;

    if (Math.abs(diff) < 48) {
      return;
    }

    movePage(diff < 0 ? pageIndex + 1 : pageIndex - 1);
  };

  return (
    <section className="history" aria-labelledby="history-heading">
      <div className="history__header">
        <h2 id="history-heading">検索履歴</h2>
      </div>

      <div className="history__carousel-frame">
        <button
          className="carousel-button carousel-button--previous"
          type="button"
          onClick={() => movePage(pageIndex - 1)}
          disabled={pageIndex === 0}
          aria-label="前の履歴を表示"
        >
          <CarouselArrowIcon direction="previous" />
        </button>

        <div className="carousel" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <div
            className="carousel__track"
            style={{ transform: `translateX(-${pageIndex * 100}%)` }}
          >
            {pages.map((page, index) => (
              <div className="carousel__slide" key={`page-${index}`}>
                {page.map((item) => (
                  <HistoryCard item={item} key={item.id} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <button
          className="carousel-button carousel-button--next"
          type="button"
          onClick={() => movePage(pageIndex + 1)}
          disabled={pageIndex === maxPage}
          aria-label="次の履歴を表示"
        >
          <CarouselArrowIcon direction="next" />
        </button>
      </div>

      {pages.length > 1 && (
        <div className="pagination" aria-label="検索履歴ページ">
          {pages.map((_, index) => (
            <button
              className="pagination__dot"
              type="button"
              key={`dot-${index}`}
              aria-label={`${index + 1}ページ目へ移動`}
              aria-current={pageIndex === index ? 'page' : undefined}
              onClick={() => movePage(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [zipcode, setZipcode] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [results, setResults] = useState<ZipcloudResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateZipcode(zipcode);

    if (validationError) {
      setError(validationError);
      setResults([]);
      setCurrentQuery('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const nextResults = await searchAddress(zipcode);

      if (nextResults.length === 0) {
        setError(NOT_FOUND_MESSAGE);
        setResults([]);
        setCurrentQuery('');
        return;
      }

      const nextHistoryItem: HistoryItem = {
        id: `${zipcode}-${Date.now()}`,
        query: zipcode,
        results: nextResults,
      };

      setCurrentQuery(zipcode);
      setResults(nextResults);
      setHistory((current) => [nextHistoryItem, ...current]);
    } catch {
      setError(GENERAL_ERROR_MESSAGE);
      setResults([]);
      setCurrentQuery('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="search-section" aria-labelledby="page-title">
        <div className="search-section__content">
          <h1 id="page-title">住所検索</h1>
          <p className="lead">
            郵便番号を入力して住所を検索できます。郵便番号はハイフン「-」有無どちらでも検索可能です。
            000-0000、0000000 の形式で入力してください。
          </p>

          <form className="search-form" onSubmit={handleSubmit} noValidate>
            <label className="visually-hidden" htmlFor="zipcode">
              郵便番号
            </label>
            <input
              id="zipcode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={8}
              value={zipcode}
              onChange={(event) => {
                setZipcode(event.target.value);
                setError('');
              }}
              placeholder="郵便番号を入力してください。"
              aria-describedby={error ? 'form-error' : undefined}
              aria-invalid={error ? 'true' : 'false'}
            />
            <button type="submit" disabled={zipcode.length === 0 || isLoading}>
              {isLoading ? '検索中' : '検索'}
            </button>
          </form>

          {error && (
            <p className="form-error" id="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      <div className="content-stack">
        {results.length > 0 && <ResultList results={results} query={currentQuery} />}
        <HistoryCarousel items={history} />
      </div>
    </main>
  );
}
