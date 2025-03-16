import React from "react";
import "./Prompt.css";

interface PromptProps {
  onNovaPartida: () => void;
}

const Prompt: React.FC<PromptProps> = ({ onNovaPartida }) => {
  return (
    <button className="nova-partida-btn" onClick={onNovaPartida}>
      Nova Partida
    </button>
  );
};

export default Prompt;



 