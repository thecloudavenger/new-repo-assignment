import { Input } from "antd";
import React from "react";


export type SearchFilters = {
  query: string;
  buyerId : string;
};

type Props = {
  filters: SearchFilters;
  onChange: (newFilters: SearchFilters) => void;
};

function RecordSearchFilters(props: Props) {
  const { filters, onChange } = props;

  const handleQueryChange = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      onChange({
        ...filters,
        query: e.currentTarget.value,
      });
    },
    [onChange, filters]
  );

  return (
    <div>
      <Input
        placeholder="Search text..."
        style={{ width: '50%' }}
        value={filters.query}
        onChange={handleQueryChange}
      />
    </div>
  );
}

export default RecordSearchFilters;
