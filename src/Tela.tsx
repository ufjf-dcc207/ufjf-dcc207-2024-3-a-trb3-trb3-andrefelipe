import React, { useEffect, useReducer, useState } from "react";
import "./Tela.css";
import Prompt from "./Prompt";

interface PokemonCard {
  id: string;
  name: string;
  image: string;
  matched: boolean;
}

interface State {
  cards: PokemonCard[];
  flippedCards: PokemonCard[];
  matchedPairs: number;
  isLoading: boolean;
  canClick: boolean;
}

const initialState: State = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  isLoading: true,
  canClick: false,
};

type Action =
  | { type: "SET_CARDS"; payload: PokemonCard[] }
  | { type: "FLIP_CARD"; payload: PokemonCard }
  | { type: "CHECK_MATCH" }
  | { type: "RESET_GAME" }
  | { type: "ENABLE_CLICKS" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CARDS":
      return { ...state, cards: action.payload, isLoading: false, canClick: false };
    case "FLIP_CARD":
      if (!state.canClick || state.flippedCards.length >= 2 || state.flippedCards.includes(action.payload)) return state;
      return { ...state, flippedCards: [...state.flippedCards, action.payload] };
    case "CHECK_MATCH":
      if (state.flippedCards.length !== 2) return state;
      const [first, second] = state.flippedCards;
      const isMatch = first.name === second.name;
      return {
        ...state,
        cards: state.cards.map((card) =>
          isMatch && (card.id === first.id || card.id === second.id) ? { ...card, matched: true } : card
        ),
        matchedPairs: isMatch ? state.matchedPairs + 1 : state.matchedPairs,
        flippedCards: [],
      };
    case "RESET_GAME":
      return initialState;
    case "ENABLE_CLICKS":
      return { ...state, canClick: true };
    default:
      return state;
  }
}

const fetchPokemon = async (): Promise<PokemonCard[]> => {
  try {
    const totalPairs = 6;
    const pokemonIds = Array.from({ length: totalPairs }, () => Math.floor(Math.random() * 151) + 1);
    const responses = await Promise.all(
      pokemonIds.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()))
    );

    let cards = responses.flatMap((pokemon) => [
      { id: pokemon.id + "A", name: pokemon.name, image: pokemon.sprites.front_default, matched: false },
      { id: pokemon.id + "B", name: pokemon.name, image: pokemon.sprites.front_default, matched: false },
    ]);

    return cards.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Erro ao buscar Pokémon:", error);
    return [];
  }
};

const Tela: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showingCards, setShowingCards] = useState(true);

  useEffect(() => {
    fetchPokemon().then((cards) => {
      dispatch({ type: "SET_CARDS", payload: cards });
      setShowingCards(true);
      setTimeout(() => {
        setShowingCards(false);
        dispatch({ type: "ENABLE_CLICKS" });
      }, 3000); // Mostra as cartas por 3 segundos antes de começar
    });
  }, []);

  const handleCardClick = (card: PokemonCard) => {
    if (!state.canClick || state.flippedCards.length >= 2 || card.matched) return;

    dispatch({ type: "FLIP_CARD", payload: card });

    if (state.flippedCards.length === 1) {
      setTimeout(() => dispatch({ type: "CHECK_MATCH" }), 1000);
    }
  };

  const handleNovaPartida = () => {
    dispatch({ type: "RESET_GAME" });
    fetchPokemon().then((cards) => {
      dispatch({ type: "SET_CARDS", payload: cards });
      setShowingCards(true);
      setTimeout(() => {
        setShowingCards(false);
        dispatch({ type: "ENABLE_CLICKS" });
      }, 3000);
    });
  };

  return (
    <div className="game-container">
      <h1>Jogo da Memória Pokémon</h1>
      {state.isLoading ? (
        <p>Carregando Pokémon...</p>
      ) : (
        <div className="grid">
          {state.cards.map((card) => (
            <div
              key={card.id}
              className={`card ${showingCards || state.flippedCards.includes(card) || card.matched ? "flipped" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              {showingCards || state.flippedCards.includes(card) || card.matched ? (
                <img src={card.image} alt={card.name} />
              ) : (
                <span className="hidden">?</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botão para nova partida */}
      <Prompt onNovaPartida={handleNovaPartida} />
    </div>
  );
};

export default Tela;
