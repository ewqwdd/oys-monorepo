import { Button, Col, Grid, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../lib/api";
import { commonActions } from "../../store/commonReducer";
import { DeleteOutlined } from "@ant-design/icons";
import UploadHero from "./UploadHero";

export default function Photos() {
  const photos = useSelector((state) => state.common?.photos) ?? [];
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const deletePhoto = (key) => {
    setIsLoading(true);
    api
      .delete("/crm/photos", {
        data: { key },
      })
      .then(() => {
        dispatch(commonActions.deletePhoto(key));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          dispatch(commonActions.logout());
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setIsLoading(true);
    api
      .get("/crm/photos")
      .then(({ data }) => {
        dispatch(commonActions.setPhotos(data));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          dispatch(commonActions.logout());
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="default_page">
      <Spin spinning={isLoading}>
        <h1>Photos</h1>
        <Row gutter={[8, 8]}>
          {photos.map((photo) => (
            <Col span={8} key={photo} style={{ position: "relative" }}>
              <Button
                danger
                style={{
                  padding: 0,
                  position: "absolute",
                  top: 12,
                  right: 12,
                  height: 32,
                  width: 32,
                }}
                onClick={() => deletePhoto(photo.key)}
              >
                <DeleteOutlined
                  style={{
                    fontSize: 18,
                  }}
                />
              </Button>
              <img
                src={photo.url}
                style={{
                  maxHeight: 320,
                  maxWidth: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt={photo}
              />
            </Col>
          ))}
          <Col span={8}>
            <UploadHero setLoading={setIsLoading} />
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
