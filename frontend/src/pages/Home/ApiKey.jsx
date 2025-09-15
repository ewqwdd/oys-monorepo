import { Button, Flex, Input, message } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function ApiKey() {
  const apiKey = useSelector((state) => state.common.user.apiKey);
  const [messageApi, contextHolder] = message.useMessage();
  const [show, setShow] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    messageApi.success("Скопійовано");
  };
  return (
    <>
      {contextHolder}
      <Flex gap={8} vertical>
        <Flex gap={4} align="center">
          <Input
            disabled
            type={show ? "text" : "password"}
            value={apiKey}
            style={{ maxWidth: 400 }}
          />
          <Button type="dashed" onClick={() => setShow(!show)}>
            {show ? "Сховати" : "Показати"}
          </Button>
        </Flex>
        <Button type="primary" onClick={copy} style={{ alignSelf: "start" }}>
          Копіювати
        </Button>
      </Flex>
    </>
  );
}
