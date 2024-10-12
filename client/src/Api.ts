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
  value : number;
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
}


export type BuyerRecordsResponse = {
  records: BuyerRecord[];
};

export type SearchRecordsResponse = {
  records: ProcurementRecord[];
  endOfResults: boolean;
};

class Api {
  async searchRecords(
    request: SearchRecordsRequest
  ): Promise<SearchRecordsResponse> {
    const response = await fetch("/api/records", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }

  async getBuyers(
  ): Promise<BuyerRecordsResponse> {
    const response = await fetch("/api/buyerrecords", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });
    return await response.json();
  }
}

export default Api;
