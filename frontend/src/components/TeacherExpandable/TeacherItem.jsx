import { Flex, Input, Typography } from "antd";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Text } = Typography;

export default function TeacherItem({ name, label, data, setData, isEditing, vertical = false, align = "center", textarea, quill }) {
  
    let Cmp

    if (textarea) {
      Cmp = Input.TextArea
    }
    else if (quill) {
      Cmp = ReactQuill
    }
    else {
      Cmp = Input
    }

    const content = quill ? <div dangerouslySetInnerHTML={{
      __html: data[name]
    }} /> : data[name]
  
  return (
    <Flex gap={8} align={align} vertical={vertical}>
      <b>{label}: </b>
      {isEditing ? (
        <Cmp
          value={data[name]}
          style={{ width: textarea ? '100%' : 'auto' }}
          onChange={(e) => setData((prev) => ({ ...prev, [name]: typeof e === 'string' ? e : e.target.value }))}
        />
      ) : (
        <Text>{content}</Text>
      )}
    </Flex>
  );
}
