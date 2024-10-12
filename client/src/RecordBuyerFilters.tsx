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
  const [buyerOptions, setBuyerOptions] = useState<BuyerRecord[]>([]); // State to hold buyer options

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const api = new Api(); // Assuming you have an Api class to handle requests
        const response = await api.getBuyers(); // Make sure this method exists in your Api class
        const options = response.records;
        
        setBuyerOptions(response.records);
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
      }
    };

    fetchBuyers(); // Fetch buyers on component mount
  }, []);

  const handleBuyerChange = (value: string) => {
    console.log(`Selected Buyer ID: ${value}`);
    onChange({ buyerId: value }); // Pass the new buyerId back to the parent component
  };

  return (
    <div>
      <label htmlFor="buyer-select">Select Buyer:</label>
      <Select
        id="buyer-select"
        value={buyers.buyerId} // Controlled component
        style={{ width: 120 }}
        onChange={handleBuyerChange}
        options={buyerOptions} // Use the fetched options
      />
    </div>
  );
}

export default RecordBuyerFilters;