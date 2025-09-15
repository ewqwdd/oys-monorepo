import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  InputNumber,
  Row,
  Select,
  TimePicker,
} from "antd";
import { weekDays } from "../lib/constants/weekDays";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function AddAvaliableTime({
  onSubmit,
  onDelete,
  initialValues,
}) {
  const [form] = Form.useForm();
  const [oneTime, setOneTime] = useState(!!initialValues?.date);

  useEffect(() => {
    form.setFieldsValue(initialValues);
    setOneTime(!!initialValues?.date);
  }, [initialValues]);

  const options = weekDays.map(({ label, value }) => ({
    label,
    value: value.toString(),
  }));

  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onSubmit}
      autoComplete="off"
      style={{ padding: "20px" }}
      form={form}
    >
      <Form.Item
        label="Час зайняття"
        name="time"
        rules={[{ required: true, message: "Виберіть час" }]}
      >
        <TimePicker.RangePicker
          format={"HH:mm"}
          minuteStep={5}
          needConfirm={false}
        />
      </Form.Item>
      {!oneTime ? (
        <Form.Item
          label="Дні зайняття"
          name="day"
          rules={[{ required: true, message: "Виберіть день" }]}
        >
          <Select placeholder="Виберіть день" options={options} mode="single" />
        </Form.Item>
      ) : (
        <Form.Item
          label="Дата зайняття"
          name="date"
          rules={[{ required: true, message: "Виберіть дату" }]}
        >
          <DatePicker
            format={"DD.MM.YYYY"}
            disabledDate={(date) => dayjs().isAfter(date)}
          />
        </Form.Item>
      )}
      <Form.Item
        label="Кількість місць"
        name="places"
        rules={[{ required: true, message: "Введіть кількість місць" }]}
      >
        <InputNumber min={1} max={100} />
      </Form.Item>
      <Form.Item
        label="Ціна"
        name="price"
        rules={[{ required: true, message: "Введіть ціну" }]}
      >
        <InputNumber min={0} max={9999} />
      </Form.Item>
      <Form.Item label="Одноразове" name="oneTime" valuePropName="checked">
        <Checkbox onChange={(v) => setOneTime(v.target.checked)} />
      </Form.Item>
      <Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Підтвердити
          </Button>
        </Form.Item>
        {onDelete && (
          <Button
            type="default"
            color="danger"
            htmlType="button"
            style={{ marginLeft: "10px" }}
            onClick={onDelete}
          >
            Видалити
          </Button>
        )}
      </Row>
    </Form>
  );
}
