import { useSelector } from "react-redux";
import TeacherExpandable from "../../components/TeacherExpandable/TeacherExpandable";

export default function TeacherHome() {
  const user = useSelector((state) => state.common.user);
  return <TeacherExpandable record={user} isAdmin={false} />;
}
