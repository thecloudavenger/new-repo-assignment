import { Modal } from "antd";
import React from "react";
import { ProcurementRecord } from "./Api";

type Props = {
  record?: ProcurementRecord;
  onClose: () => void;
};

function ProcurementRecordPreviewModal(props: Props) {
  const { record, onClose } = props;
  if (!record) return null;
  return (
    <Modal
      title={record.title}
      visible={!!record}
      onOk={onClose}
      onCancel={onClose}
      cancelButtonProps={{ style: { display: "none" } }}
      maskClosable
      width="30vw"
    >
      <p>
        <strong>{record.buyer.name}</strong>
      </p>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
        {record.description}
      </pre>
    </Modal>
  );
}

export default ProcurementRecordPreviewModal;
