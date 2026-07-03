import { SimpleForm } from "@/components/SimpleForm";
import { JINGLE_FORM } from "@/lib/data/simpleForms";

export default function JinglePage() {
  return <SimpleForm config={JINGLE_FORM} />;
}
