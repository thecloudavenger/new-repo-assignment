import { Button, Spin, Alert } from "antd";
import React from "react";
import RecordSearchFilters, { SearchFilters } from "./RecordSearchFilters";
import RecordBuyerFilters, { BuyerFilters } from "./RecordBuyerFilters";
import RecordsTable from "./RecordsTable";
import { useRecords } from "./useRecords";


function RecordSearchPage() {
  const [page, setPage] = React.useState(1);
  const [searchFilters, setSearchFilters] = React.useState<SearchFilters>({
    query: "",
    buyerId: "0",
  });

  const { records, reachedEndOfSearch, loading, error } = useRecords(searchFilters, page);

  const handleChangeFilters = React.useCallback((newFilters: SearchFilters) => {
    setSearchFilters(newFilters);
    setPage(1); // reset pagination state
  }, []);

  const handleBuyerFilters = React.useCallback((newFilters: BuyerFilters) => {
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      buyerId: newFilters.buyerId,
    }));
    setPage(1); // reset pagination state
  }, []);

  const handleLoadMore = React.useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  return (
    <>
      <div>
        <RecordBuyerFilters
          buyers={{ buyerId: searchFilters.buyerId }} 
          onChange={handleBuyerFilters}
        />
        <RecordSearchFilters
          filters={searchFilters}
          onChange={handleChangeFilters} 
        />
      </div>
      {loading && <Spin size="large" />} {/* Loading indicator */}
      {error && <Alert message="Error" description={error.message} type="error" showIcon />} 
      {records.length > 0 && (
        <>
          <RecordsTable records={records} />
          {!reachedEndOfSearch && (
            <Button onClick={handleLoadMore}>Load more</Button>
          )}
        </>
      )}
    </>
  );
}

export default RecordSearchPage;
