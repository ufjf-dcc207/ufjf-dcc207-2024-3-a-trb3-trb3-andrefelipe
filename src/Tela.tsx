import { useEffect, useReducer, useRef } from "react";
import Prompt from "./Prompt";
import "./Tela.css";

// Definição do estado inicial
interface PokemonCard {
  id: string;
  name: string;
  image: string;
  virada: boolean;
  matched: boolean;
}

interface GameState {
  cards: PokemonCard[];
  viradas: number[];
  gameStarted: boolean;
}

// Estado inicial do jogo
const initialState: GameState = {
  cards: [],
  viradas: [],
  gameStarted: false,
};

// Definição das ações do reducer
type Action =
  | { type: "SET_CARDS"; payload: PokemonCard[] }
  | { type: "FLIP_CARD"; payload: number }
  | { type: "CHECK_MATCH" }
  | { type: "RESET_GAME" }
  | { type: "START_GAME" };

// Função reducer para gerenciar o estado do jogo
function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_CARDS":
      return { ...state, cards: action.payload };
      
    case "FLIP_CARD":
      const updatedCards = state.cards.map((card, index) =>
        index === action.payload ? { ...card, virada: true } : card
      );
      return { ...state, cards: updatedCards, viradas: [...state.viradas, action.payload] };

    case "CHECK_MATCH":
      if (state.viradas.length < 2) return state;

      const [firstIndex, secondIndex] = state.viradas;
      const isMatch = state.cards[firstIndex].name === state.cards[secondIndex].name;

      const checkedCards = state.cards.map((card, index) =>
        index === firstIndex || index === secondIndex
          ? { ...card, matched: isMatch, virada: isMatch }
          : card
      );

      return { ...state, cards: checkedCards, viradas: [] };

    case "START_GAME":
      return { ...state, gameStarted: true };

    case "RESET_GAME":
      return initialState;

    default:
      return state;
  }
}

export default function Tela() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const isCheckingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    const totalPares = 6;
    const pokemonIds = Array.from({ length: totalPares }, () => Math.floor(Math.random() * 151) + 1);

    const responses = await Promise.all(
      pokemonIds.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()))
    );

    let newCards = responses.flatMap((pokemon) => [
      { id: pokemon.id + "A", name: pokemon.name, image: pokemon.sprites.front_default, virada: true, matched: false },
      { id: pokemon.id + "B", name: pokemon.name, image: pokemon.sprites.front_default, virada: true, matched: false }
    ]);

    newCards = newCards.sort(() => Math.random() - 0.5);
    dispatch({ type: "SET_CARDS", payload: newCards });

    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "START_GAME" });
    }, 3000);
  }

  function handleCardClick(index: number) {
    if (!state.gameStarted || isCheckingRef.current || state.cards[index].virada || state.cards[index].matched) return;

    dispatch({ type: "FLIP_CARD", payload: index });

    if (state.viradas.length === 1) {
      isCheckingRef.current = true;
      setTimeout(() => {
        dispatch({ type: "CHECK_MATCH" });
        isCheckingRef.current = false;
      }, 1000);
    }
  }

  function handleNovaPartida() {
    dispatch({ type: "RESET_GAME" });
    isCheckingRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    fetchPokemon();
  }

  return (
    <div className="container">
      <h1>Jogo da Memória Pokémon</h1>

      {state.cards.length === 0 ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid">
          {state.cards.map((card, index) => (
            <div
              key={card.id}
              className={`card ${card.virada || card.matched ? "virada" : ""}`}
              onClick={() => handleCardClick(index)}
            >
              {card.virada || card.matched ? <img src={card.image} alt={card.name} /> : "?"}
            </div>
          ))}
        </div>
      )}

      <Prompt onNovaPartida={handleNovaPartida} />
    </div>
  );
}
