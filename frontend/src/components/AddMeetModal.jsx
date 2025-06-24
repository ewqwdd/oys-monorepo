import { Button, DatePicker, Flex, message, Modal, Select, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatMinutes } from "../lib/helpers/minutesToString";
import { api } from "../lib/api";
import formatDate from "../lib/helpers/formatDate";
import { commonActions } from "../store/commonReducer";
import dayjs from "dayjs";

export default function AddMeetModal({ open, onClose }) {
  const teachers = useSelector((state) => state.common?.teachers);
  const clients = useSelector((state) => state.common?.clients);
  const [avaliables, setAvaliables] = useState([]);

  const [teacher, setTeacher] = useState(null);
  const [avaliable, setAvaliable] = useState(null);
  const [client, setClient] = useState(null);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [messageApi, contextHolder] = message.useMessage();

  const teacherOptions = teachers?.map((teacher) => ({
    value: teacher._id,
    label: teacher.name,
  }));

  const clientsOptions = clients?.map((client) => ({
    value: client._id,
    label: client.name + " " + client.email,
  }));

  useEffect(() => {
    if (teacher) {
      setLoading(true);
      api
        .get(`/crm/avaliable?teacherId=${teacher}`)
        .then((res) => {
          setAvaliables(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [teacher]);

  const avaliableOptions = useMemo(
    () =>
      avaliables
        .filter((a) => a.day === date?.toDate()?.getDay() - 1)
        .map((avaliable) => ({
          value: avaliable._id,
          label: `${formatMinutes(avaliable.timeFrom)} - ${formatMinutes(
            avaliable.timeTo
          )}`,
        })),
    [avaliables, date]
  );

  const days = avaliables.map((avaliable) => avaliable.day);
  const dates = avaliables.map((avaliable) => avaliable.date);

  const disabledDate = (current) => {
    return current && !days.includes(current?.toDate()?.getDay() - 1) && !dates.find(e => dayjs(current).isSame(e, "day"));
  };

  const addNewMeet = () => {
    if (loading) return;
    setLoading(true);
    api
      .post("/crm/meets", {
        client,
        date: formatDate(date.toDate()),
        avaliable,
      })
      .then((res) => {
        messageApi.success("Зустріч успішно додана");
        dispatch(commonActions.addMeet(res.data));
      })
      .finally(() => {
        setLoading(false);
        onClose();
      })
      .catch((err) => {
        messageApi.error(err.response?.data?.message || "Помилка");
      });
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Додати зустріч"
        open={open}
        onCancel={onClose}
        footer={null}
        style={{
          maxWidth: 360,
        }}
      >
        <Spin spinning={loading}>
          <Flex vertical gap={16}>
            <Select
              placeholder="Виберіть клієнта"
              options={clientsOptions}
              value={client}
              onChange={(v) => setClient(v)}
              style={{ marginTop: 16 }}
            />
            <Select
              placeholder="Виберіть вчителя"
              options={teacherOptions}
              value={teacher}
              onChange={(v) => setTeacher(v)}
            />
            <DatePicker
              placeholder="Виберіть дату"
              value={date}
              onChange={(v) => setDate(v)}
              disabledDate={disabledDate}
              disabled={!teacher || !client}
            />
            <Select
              placeholder="Виберіть час"
              options={avaliableOptions}
              value={avaliable}
              onChange={(v) => setAvaliable(v)}
              disabled={!teacher || !date || !client}
            />
            <Button
              onClick={addNewMeet}
              type="primary"
              disabled={!teacher || !date || !client || !avaliable || loading}
            >
              Додати
            </Button>
          </Flex>
        </Spin>
      </Modal>
    </>
  );
}
