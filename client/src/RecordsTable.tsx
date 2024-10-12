import { Table } from "antd";
import { ColumnType } from "antd/lib/table";
import React from "react";
import { ProcurementRecord } from "./Api";
import ProcurementRecordPreviewModal from "./ProcurementRecordPreview";

type Props = {
  records: ProcurementRecord[];
};

function RecordsTable(props: Props) {
  const { records } = props;
  const [previewedRecord, setPreviewedRecord] = React.useState<
    ProcurementRecord | undefined
  >();

  const columns = React.useMemo<ColumnType<ProcurementRecord>[]>(() => {
    return [
      {
        title: "Published",
        render: (record: ProcurementRecord) =>
          new Date(record.publishDate).toLocaleDateString(),
      },
      {
        title: "Title",
        render: (record: ProcurementRecord) => {
          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            setPreviewedRecord(record);
          };
          return (
            <a href="#" onClick={handleClick}>
              {record.title}
            </a>
          );
        },
      },
      {
        title: "Buyer name",
        render: (record: ProcurementRecord) => record.buyer.name,
      },
      {
        title: "Value",
        render: (record: ProcurementRecord) => (
          <span>
            {record.value ? (
              <>
                {record.value} {record.currency}
              </>
            ) : (
              <span>N/A</span>
            )}
          </span>
        ),
      },
      {
        title: "Stage",
        render: (record: ProcurementRecord) => {
          if (record.stage === "TENDER") {
            const closeDate = new Date(record.close_date);
            const now = new Date();
            return closeDate ? 
              (closeDate > now ? 
                `Open until ${closeDate.toLocaleDateString()}` : 
                "Closed") 
              : 
              "Open until TBD";
          } else if (record.stage === "CONTRACT") {
            return `Awarded on ${new Date(record.award_date).toLocaleDateString()}`;
          }
          
          return "Unknown stage";
        }
      },
      
    ];
  }, []);
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
