"use client";

import useSWR from "swr";

import axios from "@/config/axios";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// SWR over our own API — one generic hook instead of myklesia's
// one-hook-per-page. Pass null to skip fetching (e.g. until a form is
// filled in).
export default function useApi<T = any>(url: string | null) {
  const { data, error, mutate, isValidating } = useSWR<T>(url, fetcher);
  return {
    data,
    error: error ? (error?.response?.data as string) || "Couldn't load this" : null,
    isLoading: !!url && !error && data === undefined,
    isValidating,
    mutate,
  };
}
