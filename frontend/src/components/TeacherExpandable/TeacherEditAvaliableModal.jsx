import { message, Modal } from "antd";
import React from "react";
import AddAvaliableTime from "../../components/AddAvaliableTime";
import { commonActions } from "../../store/commonReducer";
import { useDispatch } from "react-redux";
import { api } from "../../lib/api";
import { formatMinutes } from "../../lib/helpers/minutesToString";
import dayjs from "dayjs";

export default function TeacherEditAvaliableModal({
  open,
  setOpen,
  avaliable,
}) {
  const close = () => setOpen(false);

  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = (values) => {
    console.log(values);
    dispatch(commonActions.setLoadig(true));
    const timeFrom = values.time?.[0]
      ? values.time[0].format("HH:mm")
      : undefined;
    const timeTo = values.time?.[1]
      ? values.time[1].format("HH:mm")
      : undefined;
    api
      .put("/crm/avaliable", {
        ...values,
        timeFrom,
        timeTo,
        date: values.date ? values.date.format("YYYY.MM.DD") : undefined,
        teacher: avaliable.teacher,
        _id: avaliable._id,
      })
      .then((res) => {
        dispatch(
          commonActions.editAvaliable({
            teacherId: avaliable.teacher,
            avaliable: res.data,
          }),
        );
        close();
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          dispatch(commonActions.logout());
        }
        messageApi.error(err?.response?.data?.message || "Помилка");
        console.log(err);
      })
      .finally(() => {
        dispatch(commonActions.setLoadig(false));
      });
  };

  const onDelete = () => {
    api
      .delete(`/crm/avaliable/${avaliable._id}`)
      .then(() => {
        dispatch(
          commonActions.deleteAvalialbe({
            teacherId: avaliable.teacher,
            avaliableId: avaliable._id,
          }),
        );
        close();
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          dispatch(commonActions.logout());
        }
        messageApi.error(err?.response?.data?.message || "Помилка");
        console.log(err);
      });
  };

  console.log(avaliable);

  return (
    <>
      {contextHolder}
      <Modal
        footer={null}
        closable
        onCancel={close}
        open={open}
        title={"Додати зайняття"}
      >
        <AddAvaliableTime
          initialValues={{
            time: [
              dayjs().startOf("day").set("minutes", avaliable.timeFrom),
              dayjs().startOf("day").set("minutes", avaliable.timeTo),
            ],
            day: String(avaliable.day),
            places: avaliable.places,
            price: avaliable.price,
            date: !!avaliable.date ? dayjs(avaliable.date) : undefined,
            oneTime: !!avaliable.date,
          }}
          onSubmit={onFinish}
          onDelete={onDelete}
        />
      </Modal>
    </>
  );
}
