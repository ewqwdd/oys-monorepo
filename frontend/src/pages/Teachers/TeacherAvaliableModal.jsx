import { message, Modal } from "antd";
import React from "react";
import AddAvaliableTime from "../../components/AddAvaliableTime";
import { commonActions } from "../../store/commonReducer";
import { useDispatch } from "react-redux";
import { api } from "../../lib/api";

export default function TeacherAvaliableModal({ open, setOpen, teacherId }) {
  const close = () => setOpen(false);

  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = (values) => {
    console.log(values)
    dispatch(commonActions.setLoadig(true));
    const timeFrom = values.time[0].format("HH:mm");
    const timeTo = values.time[1].format("HH:mm");
    api
      .post("/crm/avaliable", { ...values, timeFrom, timeTo, teacher: teacherId, date: values.date ? values.date.format("YYYY.MM.DD") : undefined })
      .then(({ data }) => {
        dispatch(commonActions.addAvaliable({ teacherId, avaliable: data }));
        close();
      })
      .catch((err) => {
        messageApi.error(err.response.data.message);
        console.log(err);
      })
      .finally(() => {
        dispatch(commonActions.setLoadig(false));
      });
  };
  

  return (
    <>
      {contextHolder}
      <Modal footer={null} closable onCancel={close} open={open} title={"Додати зайняття"}>
        <AddAvaliableTime teacherId={teacherId} onSubmit={onFinish} />
      </Modal>
    </>
  );
}
