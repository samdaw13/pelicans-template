import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useImageSlideshow } from './useImageSlideshow.ts';
import * as apiClient from '../api/client.ts';

function makeImage(id: number) {
  return {
    url: `https://example.com/img/${id}.jpg`,
    alt: `Pelican ${id}`,
    photographer: `Photographer ${id}`,
    photographerUrl: `https://unsplash.com/@photographer${id}`,
  };
}

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useImageSlideshow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads an initial image on mount', async () => {
    vi.spyOn(apiClient, 'fetchImage').mockResolvedValue(makeImage(1));

    const { result } = renderHook(() => useImageSlideshow(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.image).not.toBeNull());
    expect(result.current.image?.alt).toBe('Pelican 1');
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches a new image when next is called at the end of history', async () => {
    vi.spyOn(apiClient, 'fetchImage')
      .mockResolvedValueOnce(makeImage(1))
      .mockResolvedValueOnce(makeImage(2));

    const { result } = renderHook(() => useImageSlideshow(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 1'));

    act(() => result.current.onNext());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 2'));
    expect(apiClient.fetchImage).toHaveBeenCalledTimes(2);
  });

  it('uses cached image when next is called within history', async () => {
    vi.spyOn(apiClient, 'fetchImage')
      .mockResolvedValueOnce(makeImage(1))
      .mockResolvedValueOnce(makeImage(2));

    const { result } = renderHook(() => useImageSlideshow(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 1'));

    // Go forward to image 2
    act(() => result.current.onNext());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 2'));

    // Go back to image 1
    act(() => result.current.onPrevious());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 1'));

    // Go forward again — should use cache, not fetch
    act(() => result.current.onNext());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 2'));
    expect(apiClient.fetchImage).toHaveBeenCalledTimes(2);
  });

  it('sets showNoMore when previous is called at the start of history', async () => {
    vi.spyOn(apiClient, 'fetchImage').mockResolvedValue(makeImage(1));

    const { result } = renderHook(() => useImageSlideshow(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.image).not.toBeNull());

    expect(result.current.showNoMore).toBe(false);
    act(() => result.current.onPrevious());
    expect(result.current.showNoMore).toBe(true);
  });

  it('clears showNoMore when next is called', async () => {
    vi.spyOn(apiClient, 'fetchImage')
      .mockResolvedValueOnce(makeImage(1))
      .mockResolvedValueOnce(makeImage(2));

    const { result } = renderHook(() => useImageSlideshow(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.image).not.toBeNull());

    act(() => result.current.onPrevious());
    expect(result.current.showNoMore).toBe(true);

    act(() => result.current.onNext());
    await waitFor(() => expect(result.current.showNoMore).toBe(false));
  });

  it('trims history to 5 images', async () => {
    const mock = vi.spyOn(apiClient, 'fetchImage');
    for (let i = 1; i <= 7; i++) mock.mockResolvedValueOnce(makeImage(i));

    const { result } = renderHook(() => useImageSlideshow(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 1'));

    // Fetch 6 more images (7 total, history should cap at 5)
    for (let i = 0; i < 6; i++) {
      act(() => result.current.onNext());
      await waitFor(() => expect(result.current.image?.alt).toBe(`Pelican ${i + 2}`));
    }

    // At the end we should still be able to go back 4 times (5 images kept)
    act(() => result.current.onPrevious());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 6'));

    act(() => result.current.onPrevious());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 5'));

    act(() => result.current.onPrevious());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 4'));

    act(() => result.current.onPrevious());
    await waitFor(() => expect(result.current.image?.alt).toBe('Pelican 3'));

    // Should now be at start of history — next previous shows "No more images!"
    act(() => result.current.onPrevious());
    expect(result.current.showNoMore).toBe(true);
  });
});
