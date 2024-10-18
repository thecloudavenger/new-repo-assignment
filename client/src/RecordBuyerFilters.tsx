import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Select } from "antd";
import Api, { BuyerRecord } from "./Api";

export type BuyerFilters = {
  buyerId: string;
};

type Props = {
  buyers: BuyerFilters;
  onChange: (newFilters: BuyerFilters) => void;
};

function useBuyers() {
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuyers = async () => {
      const api = new Api();
      try {
        const response = await api.getBuyers();
        if (response) {
          setBuyers(response.buyers);
        } else {
          setError("No records found in response.");
        }
      } catch (error) {
        console.error("Failed to fetch buyers:", error); 
        setError("Failed to fetch buyers."); //Or Suppress based on UI need
      }
    };

    void fetchBuyers();
  }, []);

  return { buyers, error };
}

function RecordBuyerFilters(props: Props) {
  const { buyers, onChange } = props;
  const { buyers: fetchedBuyers, error } = useBuyers();

  const buyerOptions = useMemo(() => {
    const options = fetchedBuyers.map((buyer) => ({
      value: buyer.id,
      label: buyer.name,
    }));
    return [{ value: "0", label: "All" }, ...options];
  }, [fetchedBuyers]);

  const handleBuyerChange = useCallback((value: string) => {
    onChange({ buyerId: value });
  }, [onChange]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Select
        id="buyer-select"
        value={buyers.buyerId}
        style={{ width: '50%' }}
        onChange={handleBuyerChange}
        options={buyerOptions}
      />
    </div>
  );
}

export default RecordBuyerFilters;