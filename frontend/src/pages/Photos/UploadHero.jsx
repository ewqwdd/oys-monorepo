import { Button, Flex, message } from "antd";
import { useRef } from "react";
import { api } from "../../lib/api";
import { useDispatch } from "react-redux";
import { commonActions } from "../../store/commonReducer";

export default function UploadHero({ setLoading }) {
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();

  const inputRef = useRef();

  const uploadHero = (e) => {
    const file = e.target.files[0];
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      messageApi.error("Вы можете загружать только JPG/PNG файлы.");
      return;
    }
    const data = new FormData();
    data.append("image", file);
    setLoading(true);
    api
      .post("/crm/photos", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(({ data }) => {
        dispatch(commonActions.appendPhoto(data));
      })
      .catch((e) => {
        messageApi.error(e.response.data.message);
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Flex
      justify="center"
      align="center"
      style={{ height: "100%", width: "100%" }}
    >
      {contextHolder}
      <Button onClick={() => inputRef.current.click()}>Upload Hero</Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={uploadHero}
        style={{ display: "none" }}
      />
    </Flex>
  );
}
