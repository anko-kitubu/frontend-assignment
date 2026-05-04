import type { ZipcloudResponse, ZipcloudResult } from './types';

const API_ENDPOINT = 'https://zipcloud.ibsnet.co.jp/api/search';

export async function searchAddress(zipcode: string): Promise<ZipcloudResult[]> {
  const url = new URL(API_ENDPOINT);
  url.searchParams.set('zipcode', zipcode);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('network-error');
  }

  const data = (await response.json()) as ZipcloudResponse;

  if (data.status !== 200) {
    throw new Error(data.message ?? 'api-error');
  }

  return data.results ?? [];
}

