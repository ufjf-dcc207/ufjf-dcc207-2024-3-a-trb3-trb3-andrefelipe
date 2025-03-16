import { useRef } from "react";
import "./Prompt.css";

interface PromptProps {
  onNovaPartida: () => void;
}

export default function Prompt({ onNovaPartida }: PromptProps) {
  const refButton = useRef<HTMLButtonElement | null>(null);

  function handleNovaPartida() {
    onNovaPartida();
    refButton.current?.blur(); // Tira o foco do botão depois de clicar
  }

  return (
    <div className="prompt-container">
      <button ref={refButton} className="nova-partida-btn" onClick={handleNovaPartida}>
        Nova Partida
      </button>
    </div>
  );
}
