import { useEffect, useState, useRef } from "react";
import Prompt from "./Prompt";
import "./Tela.css";

interface PokemonCard {
  id: string;
  name: string;
  image: string;
  flipped: boolean;
  matched: boolean;
}

export default function Tela() {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const isCheckingRef = useRef(false); // Evita múltiplas verificações simultâneas
  const timeoutRef = useRef<number | null>(null); // Armazena o timeout para cancelamento

  useEffect(() => {
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    const totalPairs = 6;
    const pokemonIds = Array.from({ length: totalPairs }, () => Math.floor(Math.random() * 151) + 1);

    const responses = await Promise.all(
      pokemonIds.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()))
    );

    let newCards = responses.flatMap((pokemon) => [
      { id: pokemon.id + "A", name: pokemon.name, image: pokemon.sprites.front_default, flipped: true, matched: false },
      { id: pokemon.id + "B", name: pokemon.name, image: pokemon.sprites.front_default, flipped: true, matched: false }
    ]);

    newCards = newCards.sort(() => Math.random() - 0.5);
    setCards(newCards);

    // Mostrar todas as cartas viradas por 3 segundos antes de iniciar o jogo
    timeoutRef.current = window.setTimeout(() => {
      setCards((prev) => prev.map((card) => ({ ...card, flipped: false })));
      setGameStarted(true);
    }, 3000);
  }

  function handleCardClick(index: number) {
    if (!gameStarted || isCheckingRef.current || cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, index]);

    if (flippedCards.length === 1) {
      isCheckingRef.current = true;
      setTimeout(() => checkMatch(newCards, flippedCards[0], index), 1000);
    }
  }

  function checkMatch(updatedCards: PokemonCard[], firstIndex: number, secondIndex: number) {
    if (updatedCards[firstIndex].name === updatedCards[secondIndex].name) {
      updatedCards[firstIndex].matched = true;
      updatedCards[secondIndex].matched = true;
    } else {
      updatedCards[firstIndex].flipped = false;
      updatedCards[secondIndex].flipped = false;
    }

    setCards([...updatedCards]);
    setFlippedCards([]);
    isCheckingRef.current = false;
  }

  // Reinicia o jogo
  function handleNovaPartida() {
    setCards([]);
    setFlippedCards([]);
    setGameStarted(false);
    isCheckingRef.current = false;

    // Cancela timeout anterior, se ainda estiver ativo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    fetchPokemon();
  }

  return (
    <div className="container">
      <h1>Jogo da Memória Pokémon</h1>
      {cards.length === 0 ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`card ${card.flipped || card.matched ? "flipped" : ""}`}
              onClick={() => handleCardClick(index)}
            >
              {card.flipped || card.matched ? <img src={card.image} alt={card.name} /> : "?"}
            </div>
          ))}
        </div>
      )}

      {/* Botão para iniciar nova partida */}
      <Prompt onNovaPartida={handleNovaPartida} />
    </div>
  );
}
