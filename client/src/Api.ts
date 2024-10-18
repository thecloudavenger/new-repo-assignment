export type SearchRecordsRequest = {
  textSearch?: string;
  buyerId?: string;
  limit: number;
  offset: number;
};

export type ProcurementRecord = {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  value: number;
  currency: string;
  stage: string;
  close_date: string;
  award_date: string;
  buyer: {
    id: string;
    name: string;
  };
};

export type BuyerRecord = {
  id: string;
  name: string;
};

export type BuyerRecordsResponse = {
  buyers: BuyerRecord[];
};

export type SearchRecordsResponse = {
  records: ProcurementRecord[];
  endOfResults: boolean;
};

class Api {
  async searchRecords(
    request: SearchRecordsRequest
  ): Promise<SearchRecordsResponse> {
    // Input validation
    if (typeof request.limit !== 'number' || request.limit <= 0 || request.limit > 100) {
      throw new Error("Limit must be a number between 1 and 100.");
    }

    if (typeof request.offset !== 'number' || request.offset < 0) {
      throw new Error("Offset must be a non-negative number.");
    }

    if (request.textSearch && typeof request.textSearch !== 'string') {
      throw new Error("textSearch must be a string.");
    }

    if (request.buyerId && typeof request.buyerId !== 'string') {
      throw new Error("buyerId must be a string.");
    }

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(request),
      });

     
      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error while searching records:", error);
      throw new Error("An error occurred while searching for records.");
    }
  }

  async getBuyers(): Promise<BuyerRecordsResponse> {
    try {
      const response = await fetch("/api/buyers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch buyers: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error while fetching buyers:", error);
      throw new Error("An error occurred while fetching buyers.");
    }
  }
}

export default Api;
