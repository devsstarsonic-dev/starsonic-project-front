// O estado do wizard agora vive em um Context (compartilhado entre as etapas).
// Mantido aqui como re-export para não quebrar os imports existentes.
export { useComposition } from "@/lib/compositor/CompositionContext";
