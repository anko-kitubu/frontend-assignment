import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('App', () => {
  afterEach(() => {
    cleanup();
    mockFetch.mockReset();
  });

  it('disables submit while the zipcode input is empty', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: '検索' })).toBeDisabled();
  });

  it('shows a validation error without calling the API for invalid characters', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('郵便番号'), { target: { value: 'aaaaaaaa' } });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));

    expect(
      screen.getByText('郵便番号は半角数字のみまたは半角数字とハイフンのみで入力してください。'),
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows a validation error without calling the API for invalid format', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('郵便番号'), { target: { value: '11111111' } });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));

    expect(
      screen.getByText('郵便番号は半角数字でハイフンありの8桁かハイフンなしの7桁で入力してください。'),
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('renders search results and adds them to history', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        message: null,
        results: [
          {
            zipcode: '0790177',
            prefcode: '1',
            address1: '北海道',
            address2: '美唄市',
            address3: '上美唄町協和',
            kana1: 'ﾎｯｶｲﾄﾞｳ',
            kana2: 'ﾋﾞﾊﾞｲｼ',
            kana3: 'ｶﾐﾋﾞﾊﾞｲﾁｮｳｷｮｳﾜ',
          },
        ],
      }),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText('郵便番号'), { target: { value: '0790177' } });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));

    await waitFor(() => {
      expect(screen.getAllByText('住所: 北海道美唄市上美唄町協和')).toHaveLength(2);
    });

    expect(screen.getByRole('heading', { name: '検索履歴' })).toBeInTheDocument();
    expect(screen.getAllByText('郵便番号: 0790177')).toHaveLength(2);
  });

  it('shows a not found error when API returns no results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        message: null,
        results: null,
      }),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText('郵便番号'), { target: { value: '111-1111' } });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));

    await waitFor(() => {
      expect(screen.getByText('郵便番号が存在しません。')).toBeInTheDocument();
    });
  });
});
