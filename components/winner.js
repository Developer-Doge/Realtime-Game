const Winner = ({ winner, score }) => {
  return (
    <div className="container mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">Game Over</h1>
      <h2 className="text-3xl mb-2">The winner is:</h2>
      <h3 className="text-2xl font-bold">{winner}</h3>
      <p className="text-xl">With a score of {score}</p>
    </div>
  );
};

export default Winner;
