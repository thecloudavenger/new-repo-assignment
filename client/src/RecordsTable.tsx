import React from "react";
import { Table } from "antd";
import { ProcurementRecord } from "./Api";
import ProcurementRecordPreviewModal from "./ProcurementRecordPreview";

type Props = {
  records: ProcurementRecord[];
};

// Helper function to render currency and value
const renderCurrencyValue = (value: number | null, currency: string) => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return <span>N/A</span>; // Handle invalid values
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(value);
  } catch (error) {
    console.error("Invalid currency or formatting error:", error);
    return <span>N/A</span>; // Handle invalid currency
  }
};

// Helper function to render the stage based on procurement status
const renderStage = (record: ProcurementRecord) => {
  const closeDate = record.close_date ? new Date(record.close_date) : null;
  const awardDate = record.award_date ? new Date(record.award_date) : null;
  const now = new Date();

  if (record.stage === "TENDER") {
    return closeDate && !isNaN(closeDate.getTime())
      ? closeDate > now
        ? `Open until ${closeDate.toLocaleDateString()}`
        : "Closed"
      : "Open until TBD";
  }

  if (record.stage === "CONTRACT") {
    return `Awarded on ${awardDate.toLocaleDateString()}`;
  }

  return "Unknown stage";
};

function RecordsTable({ records }: Props) {
  const [previewedRecord, setPreviewedRecord] = React.useState<
    ProcurementRecord | undefined
  >();

  const handleTitleClick = (record: ProcurementRecord) => (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    setPreviewedRecord(record);
  };

  // Define table columns
  const columns = [
    {
      title: "Published",
      render: (record: ProcurementRecord) =>
        new Date(record.publishDate).toLocaleDateString(),
    },
    {
      title: "Title",
      render: (record: ProcurementRecord) => (
        <a href="#" onClick={handleTitleClick(record)}>
          {record.title}
        </a>
      ),
    },
    {
      title: "Buyer name",
      render: (record: ProcurementRecord) => record.buyer.name,
    },
    {
      title: "Value",
      render: (record: ProcurementRecord) =>
        renderCurrencyValue(record.value, record.currency),
    },
    {
      title: "Stage",
      render: (record: ProcurementRecord) => renderStage(record),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={records} pagination={false} />
      <ProcurementRecordPreviewModal
        record={previewedRecord}
        onClose={() => setPreviewedRecord(undefined)}
      />
    </>
  );
}

export default RecordsTable;
