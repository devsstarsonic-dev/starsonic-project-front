import { SimpleForm } from "@/components/SimpleForm";
import { INSTRUMENTAL_FORM } from "@/lib/data/simpleForms";

export default function InstrumentalPage() {
  return <SimpleForm config={INSTRUMENTAL_FORM} />;
}
