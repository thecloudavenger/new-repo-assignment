import { Select } from "antd";
import React, { useEffect, useState } from "react";
import Api, { BuyerRecord } from "./Api"; // Import your API class or service

export type BuyerFilters = {
  buyerId: string;
};

type Props = {
  buyers: BuyerFilters;
  onChange: (newFilters: BuyerFilters) => void;
};

function RecordBuyerFilters(props: Props) {
  const { buyers, onChange } = props;
  const [buyerOptions, setBuyerOptions] = useState<{ value: string; label: string }[]>([]); // Update state type

  useEffect(() => {
    void (async () => {
      const api = new Api();
      try {
        const response = await api.getBuyers();
        // Check if 'records' exists before mapping
        if (response) {
          const options = response.buyers.map((buyer: BuyerRecord) => ({
            value: buyer.id,
            label: buyer.name,
          }));
          // Add the default option at the start
          const defaultOption = { value: "0", label: "All" };

          setBuyerOptions([defaultOption, ...options]); // Prepend the default option

        } else {
          console.error("No records found in response.");
        }
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
      }
    })();
  }, []);
  


  const handleBuyerChange = (value: string) => {
    console.log(`Selected Buyer ID: ${value}`);
    onChange({ buyerId: value }); // Pass the new buyerId back to the parent component
  };

  return (
    <div>
      <Select
        id="buyer-select"
        value={buyers.buyerId} // Controlled component
        style={{ width: '50%' }}
        onChange={handleBuyerChange}
        options={buyerOptions} // Use the fetched options
      />
    </div>
  );
}

export default RecordBuyerFilters;