import { useEffect, useState } from "react";
import Api from "./Api";
import { ProcurementRecord } from "./Api";

export const useRecords = (searchFilters: { query: string; buyerId: string }, page: number) => {
  const [records, setRecords] = useState<ProcurementRecord[]>([]);
  const [reachedEndOfSearch, setReachedEndOfSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching

      try {
        const api = new Api();
        const response = await api.searchRecords({
          textSearch: searchFilters.query,
          buyerId: searchFilters.buyerId,
          limit: PAGE_SIZE,
          offset: PAGE_SIZE * (page - 1),
        });

        if (page === 1) {
          setRecords(response.records);
        } else {
          setRecords((oldRecords) => [...oldRecords, ...response.records]);
        }
        setReachedEndOfSearch(response.endOfResults);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false); 
      }
    };

    fetchRecords();
  }, [searchFilters, page]);

  return { records, reachedEndOfSearch, loading, error };
};
