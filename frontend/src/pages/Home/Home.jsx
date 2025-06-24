import { Card, Col, Row, Typography } from "antd";
import { useSelector } from "react-redux";
import ApiKey from "./ApiKey";
import TeacherHome from "./TeacherHome";

const { Title } = Typography;

export default function Home() {
  const user = useSelector((state) => state.common.user);
  const isAdmin = user?.role === 'user';
  if (!user) return null; // Handle case where user is not defined
  return (
    <div className="default_page">
      <Title
        level={3}
        style={{
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Hello, {isAdmin ? user.username : user.name}
      </Title>
      {isAdmin ? <Row justify="space-evenly" style={{ marginTop: 24 }}>
        <Col span={9}>
          <Card title="API Key">
            <ApiKey />
          </Card>
        </Col>
      </Row> : <TeacherHome  />}
    </div>
  );
}
